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
            embedding_dim)
        self.item_embedding = nn.Embedding(
            num_items, 
            embedding_dim)
        
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
                embedding_dim  * 3 + 16,
                128
                ),
            nn.ReLU(),
            nn.Dropout(0.2),

            nn.Linear(128, 64),
            nn.ReLU(),

            nn.Linear(64, 1)
        )

    def forward(
        self, 
        user_ids, 
        item_ids,
        category_ids,
        prices
        ):
        user_emb = self.user_embedding(user_ids)
        item_emb = self.item_embedding(item_ids)
        category_emb = self.category_embedding(category_ids)
        prices = prices.view(-1, 1)
        price_emb = self.price_fc(prices)

        x = torch.cat([
            user_emb, 
            item_emb,
            category_emb,
            price_emb
            ],
            dim=1)
        return self.mlp(x).squeeze()