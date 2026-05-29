import numpy as np

def precision_at_k(
    recommended_items,
    relevant_items,
    k: int = 10
):
    recommended_k = recommended_items[:k]

    if len(recommended_k) == 0:
        return 0.0

    hits = len(
        set(recommended_k) &
        set(relevant_items)
    )

    return hits / len(recommended_k)

def recall_at_k(
    recommended_items,
    relevant_items,
    k: int = 10
):
    recommended_k = recommended_items[:k]

    if len(relevant_items) == 0:
        return 0.0

    hits = len(
        set(recommended_k) &
        set(relevant_items)
    )

    return hits / len(relevant_items)

def f1_at_k(
    recommended_items,
    relevant_items,
    k: int = 10
):
    precision = precision_at_k(
        recommended_items,
        relevant_items,
        k
    )

    recall = recall_at_k(
        recommended_items,
        relevant_items,
        k
    )

    if precision + recall == 0:
        return 0.0

    return (
        2 * precision * recall
        / (precision + recall)
    )

def ndcg_at_k(
    recommended_items,
    relevant_items,
    k: int = 10
):
    recommended_k = recommended_items[:k]

    dcg = 0.0

    for idx, item in enumerate(recommended_k):
        if item in relevant_items:
            dcg += 1 / np.log2(idx + 2)

    ideal_dcg = sum(
        1 / np.log2(i + 2)
        for i in range(
            min(len(relevant_items), k)
        )
    )

    if ideal_dcg == 0:
        return 0.0

    return dcg / ideal_dcg

def hit_rate_at_k(
    recommended_items,
    relevant_items,
    k: int = 10
):
    recommended_k = recommended_items[:k]

    return int(
        len(
            set(recommended_k)
            & set(relevant_items)
        ) > 0
    )