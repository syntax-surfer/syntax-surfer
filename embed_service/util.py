from sentence_transformers import SentenceTransformer

model = SentenceTransformer('multi-qa-mpnet-base-dot-v1')

def convert_to_vector(sentence):
    vector = model.encode(sentence).tolist()
    return vector

def template_vector():
    vector = [0.0 for i in range (0, 768)]
    return vector