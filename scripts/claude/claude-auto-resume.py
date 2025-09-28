#!/usr/bin/env python3
"""
Claude Code 자동 재개 시스템
토큰 부족으로 중단된 Claude Code 세션을 5시간 후 자동으로 재개합니다.
"""

import os
import sys
import time
import json
import pickle
import signal
import subprocess
import threading
from datetime import datetime, timedelta
from pathlib import Path
import argparse
import logging

class ClaudeAutoResume:
    def __init__(self):
        self.home_dir = Path.home()
        self.data_dir = self.home_dir / '.claude-auto-resume'
        self.data_dir.mkdir(exist_ok=True)

        self.session_file = self.data_dir / 'session.json'
        self.state_file = self.data_dir / 'state.pickle'
        self.log_file = self.data_dir / 'auto-resume.log'

        # 5시간 = 5 * 60 * 60 초
        self.resume_interval = 5 * 60 * 60

        # 현재 세션 정보
        self.current_session = {
            'working_directory': os.getcwd(),
            'last_command': '',
            'conversation_history': [],
            'start_time': datetime.now().isoformat(),
            'status': 'active',
            'pid': os.getpid(),
            'interrupted_at': None,
            'resume_scheduled': None
        }

        self.setup_logging()
        self.setup_signal_handlers()

        # 기존 세션 복원 시도
        self.restore_previous_session()

    def setup_logging(self):
        """로깅 설정"""
        logging.basicConfig(
            level=logging.INFO,
            format='%(asctime)s - %(levelname)s - %(message)s',
            handlers=[
                logging.FileHandler(self.log_file),
                logging.StreamHandler()
            ]
        )
        self.logger = logging.getLogger(__name__)

    def setup_signal_handlers(self):
        """시그널 핸들러 설정 - Claude 프로세스 종료 감지"""
        signal.signal(signal.SIGINT, self.handle_interruption)
        signal.signal(signal.SIGTERM, self.handle_interruption)

    def handle_interruption(self, signum, frame):
        """Claude 프로세스 중단 처리"""
        self.logger.info(f"🚨 Claude 프로세스 중단 감지 (Signal: {signum})")

        self.current_session['interrupted_at'] = datetime.now().isoformat()
        self.current_session['status'] = 'interrupted'

        # 현재 작업 상태 저장
        self.save_session()

        # 5시간 후 재개 스케줄링
        self.schedule_resume()

        self.logger.info("💾 세션 저장 완료. 5시간 후 자동 재개됩니다.")
        sys.exit(0)

    def save_session(self):
        """현재 세션 정보 저장"""
        try:
            # JSON 형태로 세션 정보 저장
            with open(self.session_file, 'w') as f:
                json.dump(self.current_session, f, indent=2, ensure_ascii=False)

            # Pickle 형태로도 백업 저장
            with open(self.state_file, 'wb') as f:
                pickle.dump(self.current_session, f)

            self.logger.info("✅ 세션 데이터 저장 완료")

        except Exception as e:
            self.logger.error(f"❌ 세션 저장 실패: {e}")

    def restore_previous_session(self):
        """이전 세션 복원"""
        try:
            if self.session_file.exists():
                with open(self.session_file, 'r') as f:
                    saved_session = json.load(f)

                if saved_session.get('status') == 'interrupted':
                    self.logger.info("🔄 중단된 세션 발견")

                    # 재개 시간 확인
                    interrupted_time = datetime.fromisoformat(saved_session['interrupted_at'])
                    resume_time = interrupted_time + timedelta(seconds=self.resume_interval)

                    if datetime.now() >= resume_time:
                        self.logger.info("⏰ 재개 시간 도달 - 세션 복원 시작")
                        self.resume_session(saved_session)
                    else:
                        remaining = (resume_time - datetime.now()).total_seconds()
                        self.logger.info(f"⏳ 재개까지 {int(remaining/60)}분 남음")

        except Exception as e:
            self.logger.error(f"❌ 세션 복원 실패: {e}")

    def resume_session(self, saved_session):
        """저장된 세션으로 Claude 재시작"""
        try:
            self.logger.info("🚀 Claude Code 재시작 중...")

            # 작업 디렉토리 복원
            working_dir = saved_session.get('working_directory', os.getcwd())
            os.chdir(working_dir)

            # 마지막 명령어 복원
            last_command = saved_session.get('last_command', '')

            if last_command:
                self.logger.info(f"📝 마지막 명령어 복원: {last_command}")

                # Claude 재시작 및 명령어 전달
                self.restart_claude_with_command(last_command)
            else:
                self.logger.info("🔄 Claude Code 재시작")
                self.restart_claude()

            # 세션 파일 정리
            self.session_file.unlink(missing_ok=True)
            self.state_file.unlink(missing_ok=True)

        except Exception as e:
            self.logger.error(f"❌ 세션 재개 실패: {e}")

    def restart_claude_with_command(self, command):
        """특정 명령어로 Claude 재시작"""
        try:
            # Claude 프로세스 시작
            process = subprocess.Popen(
                ['claude', command],
                stdin=subprocess.PIPE,
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE,
                text=True
            )

            self.logger.info("✅ Claude 재시작 성공")

            # 프로세스 완료 대기
            stdout, stderr = process.communicate()

            if process.returncode == 0:
                self.logger.info("🎉 명령어 실행 완료")
                if stdout:
                    print(stdout)
            else:
                self.logger.error(f"❌ 명령어 실행 실패: {stderr}")

        except Exception as e:
            self.logger.error(f"❌ Claude 재시작 실패: {e}")

    def restart_claude(self):
        """Claude 대화형 모드로 재시작"""
        try:
            self.logger.info("🔄 Claude 대화형 모드 시작")

            # Claude 대화형 세션 시작
            os.execvp('claude', ['claude'])

        except Exception as e:
            self.logger.error(f"❌ Claude 재시작 실패: {e}")

    def schedule_resume(self):
        """5시간 후 재개 스케줄링"""
        resume_time = datetime.now() + timedelta(seconds=self.resume_interval)
        self.current_session['resume_scheduled'] = resume_time.isoformat()

        self.logger.info(f"⏰ 재개 예정 시간: {resume_time.strftime('%Y-%m-%d %H:%M:%S')}")

        # cron 작업 생성 또는 at 명령 사용
        self.create_resume_job(resume_time)

    def create_resume_job(self, resume_time):
        """시스템 스케줄러를 사용한 재개 작업 생성"""
        try:
            # 현재 스크립트 경로
            script_path = Path(__file__).absolute()

            # at 명령을 사용한 스케줄링 (macOS/Linux)
            at_command = f'echo "cd {os.getcwd()} && python3 {script_path} --resume" | at {resume_time.strftime("%H:%M %m/%d/%Y")}'

            result = subprocess.run(at_command, shell=True, capture_output=True, text=True)

            if result.returncode == 0:
                self.logger.info("✅ 시스템 스케줄러에 재개 작업 등록 완료")
            else:
                self.logger.warning("⚠️ at 명령 실패, 대안 방법 사용")
                self.create_launchd_job(resume_time)

        except Exception as e:
            self.logger.error(f"❌ 스케줄링 실패: {e}")

    def create_launchd_job(self, resume_time):
        """macOS launchd를 사용한 스케줄링"""
        try:
            job_label = f"com.claude.auto-resume.{int(time.time())}"
            plist_path = self.home_dir / 'Library' / 'LaunchAgents' / f'{job_label}.plist'

            # LaunchAgent plist 파일 생성
            plist_content = f"""<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>Label</key>
    <string>{job_label}</string>
    <key>ProgramArguments</key>
    <array>
        <string>/usr/bin/python3</string>
        <string>{Path(__file__).absolute()}</string>
        <string>--resume</string>
    </array>
    <key>StartCalendarInterval</key>
    <dict>
        <key>Year</key>
        <integer>{resume_time.year}</integer>
        <key>Month</key>
        <integer>{resume_time.month}</integer>
        <key>Day</key>
        <integer>{resume_time.day}</integer>
        <key>Hour</key>
        <integer>{resume_time.hour}</integer>
        <key>Minute</key>
        <integer>{resume_time.minute}</integer>
    </dict>
    <key>WorkingDirectory</key>
    <string>{os.getcwd()}</string>
    <key>RunAtLoad</key>
    <false/>
</dict>
</plist>"""

            # plist 파일 저장
            os.makedirs(plist_path.parent, exist_ok=True)
            with open(plist_path, 'w') as f:
                f.write(plist_content)

            # launchctl로 작업 등록
            subprocess.run(['launchctl', 'load', str(plist_path)], check=True)

            self.logger.info("✅ macOS LaunchAgent 등록 완료")

        except Exception as e:
            self.logger.error(f"❌ LaunchAgent 등록 실패: {e}")

    def monitor_claude_process(self):
        """Claude 프로세스 모니터링 시작"""
        self.logger.info("👀 Claude 프로세스 모니터링 시작")

        def monitor():
            while True:
                try:
                    # Claude 프로세스 확인
                    result = subprocess.run(
                        ['pgrep', '-f', 'claude'],
                        capture_output=True,
                        text=True
                    )

                    if result.returncode != 0:
                        self.logger.warning("⚠️ Claude 프로세스가 종료된 것 같습니다")
                        self.handle_interruption(signal.SIGTERM, None)
                        break

                    time.sleep(10)  # 10초마다 확인

                except Exception as e:
                    self.logger.error(f"❌ 프로세스 모니터링 오류: {e}")
                    time.sleep(30)

        # 백그라운드 스레드에서 모니터링
        monitor_thread = threading.Thread(target=monitor, daemon=True)
        monitor_thread.start()

    def update_last_command(self, command):
        """마지막 명령어 업데이트"""
        self.current_session['last_command'] = command
        self.save_session()

    def start_interactive_mode(self):
        """대화형 모드에서 Claude 시작"""
        self.logger.info("🎯 Claude Code 대화형 모드 시작")
        self.logger.info("💡 Ctrl+C로 종료하면 5시간 후 자동으로 재개됩니다")

        # 프로세스 모니터링 시작
        self.monitor_claude_process()

        try:
            # Claude 실행
            subprocess.run(['claude'], check=True)

        except KeyboardInterrupt:
            self.logger.info("🛑 사용자가 중단했습니다")
            self.handle_interruption(signal.SIGINT, None)

        except subprocess.CalledProcessError as e:
            if e.returncode == 1:  # 토큰 부족으로 인한 종료
                self.logger.info("🚨 토큰 부족으로 인한 종료 감지")
                self.handle_interruption(signal.SIGTERM, None)
            else:
                self.logger.error(f"❌ Claude 실행 오류: {e}")

def main():
    parser = argparse.ArgumentParser(description='Claude Code 자동 재개 시스템')
    parser.add_argument('--resume', action='store_true', help='저장된 세션 재개')
    parser.add_argument('--monitor', action='store_true', help='모니터링만 시작')
    parser.add_argument('--status', action='store_true', help='현재 상태 확인')
    parser.add_argument('--clean', action='store_true', help='저장된 세션 데이터 정리')

    args = parser.parse_args()

    resume_system = ClaudeAutoResume()

    if args.resume:
        print("🔄 저장된 세션 재개 중...")
        # 재개 모드는 이미 __init__에서 처리됨

    elif args.monitor:
        print("👀 Claude 프로세스 모니터링 시작...")
        resume_system.monitor_claude_process()

        # 모니터링 유지
        try:
            while True:
                time.sleep(1)
        except KeyboardInterrupt:
            print("\n🛑 모니터링 중단")

    elif args.status:
        if resume_system.session_file.exists():
            with open(resume_system.session_file, 'r') as f:
                session = json.load(f)
            print("📊 현재 세션 상태:")
            print(json.dumps(session, indent=2, ensure_ascii=False))
        else:
            print("📭 저장된 세션이 없습니다")

    elif args.clean:
        resume_system.session_file.unlink(missing_ok=True)
        resume_system.state_file.unlink(missing_ok=True)
        print("🗑️ 저장된 세션 데이터 정리 완료")

    else:
        # 기본 모드: Claude 시작 및 모니터링
        resume_system.start_interactive_mode()

if __name__ == "__main__":
    main()