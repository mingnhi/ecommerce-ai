import torch
import torch.nn as nn


class HybridNCF(nn.Module):
    def __init__(
        self,
        num_users: int,
        num_items: int,
        num_categories: int,
        embedding_dim: int = 64
    ):
        super().__init__()
        self.user_embedding = nn.Embedding(
            num_users,
            embedding_dim
        )

        self.item_embedding = nn.Embedding(
            num_items,
            embedding_dim
        )

        self.category_embedding = nn.Embedding(
            num_categories,
            embedding_dim
        )

        self.price_fc = nn.Sequential(
            nn.Linear(1, 16),
            nn.ReLU()
        )

        self.mlp = nn.Sequential(
            nn.Linear(
                embedding_dim * 3 + 16,
                128
            ),
            nn.ReLU(),
            nn.Dropout(0.2),

            nn.Linear(128, 64),
            nn.ReLU(),
            nn.Dropout(0.2),

            nn.Linear(64, 32),
            nn.ReLU(),

            nn.Linear(32, 1)
        )

    def forward(
        self,
        user_id,
        item_id,
        category_id,
        price
    ):
        user_emb = self.user_embedding(user_id)

        item_emb = self.item_embedding(item_id)

        category_emb = self.category_embedding(category_id)

        price = price.view(-1, 1)

        price_emb = self.price_fc(price)

        x = torch.cat(
            [
                user_emb,
                item_emb,
                category_emb,
                price_emb
            ],
            dim=1
        )

        output = self.mlp(x)

        return output.squeeze()