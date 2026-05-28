import torch
import torch.nn as nn


class HybridNCF(nn.Module):
    def __init__(
        self,
        num_users,
        num_items,
        num_categories,
        embedding_dim=64
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

        input_dim = embedding_dim * 3 + 16

        self.mlp = nn.Sequential(
            nn.Linear(input_dim, 128),
            nn.ReLU(),
            nn.Dropout(0.3),

            nn.Linear(128, 64),
            nn.ReLU(),
            nn.Dropout(0.2),

            nn.Linear(64, 32),
            nn.ReLU(),

            nn.Linear(32, 1)
        )

    def forward(
        self,
        user,
        item,
        category,
        price
    ):
        user_emb = self.user_embedding(user)

        item_emb = self.item_embedding(item)

        category_emb = self.category_embedding(category)

        price = price.unsqueeze(1)

        price_feature = self.price_fc(price)

        x = torch.cat(
            [
                user_emb,
                item_emb,
                category_emb,
                price_feature
            ],
            dim=1
        )

        output = self.mlp(x)

        return output.squeeze()