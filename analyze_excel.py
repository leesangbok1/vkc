import pandas as pd
import json

def analyze_excel_files():
    results = {}

    # 1. WBS 파일 분석
    try:
        wbs_file = '/Users/bk/Desktop/Viet_K_Connect_Specification_WBS.xlsx'
        wbs_data = pd.read_excel(wbs_file, sheet_name=None)

        print("=== WBS 파일 분석 ===")
        for sheet_name, df in wbs_data.items():
            print(f"\n시트: {sheet_name}")
            print(f"컬럼: {list(df.columns)}")
            print(f"데이터 샘플:\n{df.head(10).to_string()}")
    except Exception as e:
        print(f"WBS 파일 읽기 오류: {e}")

    # 2. User Flow Pages 파일 분석
    try:
        flow_file = '/Users/bk/Desktop/Viet_K_Connect_User_Flow_Pages.xlsx'
        flow_data = pd.read_excel(flow_file, sheet_name=None)

        print("\n\n=== User Flow Pages 파일 분석 ===")
        for sheet_name, df in flow_data.items():
            print(f"\n시트: {sheet_name}")
            print(f"컬럼: {list(df.columns)}")
            print(f"데이터 샘플:\n{df.head(10).to_string()}")
    except Exception as e:
        print(f"User Flow 파일 읽기 오류: {e}")

    # 3. System Architecture 파일 분석
    try:
        arch_file = '/Users/bk/Desktop/Viet_K_Connect_System_Architecture.xlsx'
        arch_data = pd.read_excel(arch_file, sheet_name=None)

        print("\n\n=== System Architecture 파일 분석 ===")
        for sheet_name, df in arch_data.items():
            print(f"\n시트: {sheet_name}")
            print(f"컬럼: {list(df.columns)}")
            print(f"데이터 샘플:\n{df.head(10).to_string()}")
    except Exception as e:
        print(f"Architecture 파일 읽기 오류: {e}")

if __name__ == "__main__":
    analyze_excel_files()