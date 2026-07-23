import os
from dotenv import load_dotenv
from groq import Groq

load_dotenv()

client = Groq(
    api_key=os.getenv("GROQ_API_KEY")
)


def ask_gemini(prompt: str, dataset_summary: dict | None = None):

    system_prompt = """
You are InsightIQ AI.

You are an expert:

• Data Analyst
• Business Analyst
• Data Scientist
• Machine Learning Engineer

Always:

- Answer professionally.
- Use bullet points.
- Give business insights.
- Recommend cleaning steps.
- Keep answers concise.
"""

    if dataset_summary:

        user_prompt = f"""
Dataset Summary

{dataset_summary}

User Question

{prompt}

Answer ONLY using the dataset summary.
"""

    else:

        user_prompt = prompt

    try:

        response = client.chat.completions.create(
            model="llama-3.1-8b-instant",
            messages=[
                {
                    "role": "system",
                    "content": system_prompt,
                },
                {
                    "role": "user",
                    "content": user_prompt,
                },
            ],
            temperature=0.3,
            max_tokens=800,
        )

        return response.choices[0].message.content

    except Exception as e:

        print("========== GROQ ERROR ==========")
        print(e)
        print("===============================")

        raise