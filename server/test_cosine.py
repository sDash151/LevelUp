import json
import math

with open('src/data/exercise_embeddings.json', 'r') as f:
    embeddings = json.load(f)

def cosine(v1, v2):
    dot = sum(x*y for x,y in zip(v1, v2))
    norm1 = math.sqrt(sum(x*x for x in v1))
    norm2 = math.sqrt(sum(y*y for y in v2))
    return dot / (norm1 * norm2)

target_vec = embeddings.get('bench-press-barbell') or embeddings.get('bench-press')
if not target_vec:
    target_vec = list(embeddings.values())[0]

best = -1
best_name = ''
for k, v in embeddings.items():
    score = cosine(target_vec, v)
    if score > best and score < 0.99:
        best = score
        best_name = k

print("Best match for target:", best_name, "score:", best)
