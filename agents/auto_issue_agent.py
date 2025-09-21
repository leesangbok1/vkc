import sys
import json

def guess_issue_type(description):
    """Heuristic to guess the issue type from the description."""
    desc_lower = description.lower()
    if any(keyword in desc_lower for keyword in ['버그', '수정', '고침', 'fix', 'bug', 'error']):
        return '버그 리포트'
    if any(keyword in desc_lower for keyword in ['추가', '개발', '구현', 'add', 'feature', 'implement']):
        return '기능 요청'
    if any(keyword in desc_lower for keyword in ['리팩토링', '개선', 'refactor', 'improve', 'optimize']):
        return '코드 리팩토링'
    if any(keyword in desc_lower for keyword in ['문서', '정리', 'doc', 'documentation', 'template']):
        return '문서'
    return '기타'

def generate_issue_proposal(task_description):
    """
    Generates a structured issue proposal from a task description.
    """
    # A simple way to generate a title is to take the first meaningful line.
    title = task_description.strip().split('\n')[0]

    # Guess the issue type based on keywords.
    issue_type = guess_issue_type(task_description)

    # The full task description becomes the issue description.
    description = task_description

    proposal = {
        "title": title,
        "type": issue_type,
        "description": description
    }

    # Print the proposal as a JSON string to be captured by the calling process.
    print(json.dumps(proposal, ensure_ascii=False))

if __name__ == "__main__":
    if len(sys.argv) > 1:
        # The first argument is the script name, the rest is the description.
        full_description = " ".join(sys.argv[1:])
        generate_issue_proposal(full_description)
    else:
        # Provide usage instructions if run without arguments.
        print(json.dumps({"error": "No task description provided.", "usage": "python auto_issue_agent.py \"<task description>\""}))
