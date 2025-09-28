#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const chokidar = require('chokidar');

class FileOrganizer {
  constructor() {
    this.projectRoot = process.cwd();
    this.configPath = path.join(this.projectRoot, 'config/file-organization.json');
    this.config = this.loadConfig();
    this.logFile = path.join(this.projectRoot, 'logs/file-organization.log');
    this.isWatching = false;
  }

  loadConfig() {
    try {
      return JSON.parse(fs.readFileSync(this.configPath, 'utf8'));
    } catch (error) {
      console.error('Config 파일을 로드할 수 없습니다:', error.message);
      process.exit(1);
    }
  }

  log(message) {
    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] ${message}\n`;

    console.log(message);

    if (this.config.autoMove.logMoves) {
      // logs 디렉토리 생성
      const logsDir = path.dirname(this.logFile);
      if (!fs.existsSync(logsDir)) {
        fs.mkdirSync(logsDir, { recursive: true });
      }

      fs.appendFileSync(this.logFile, logMessage);
    }
  }

  // 파일명에서 컴포넌트 유형 추출
  extractComponentType(filename, baseName) {
    const { destinations } = this.config.rules.components;

    for (const [category, keywords] of Object.entries(destinations)) {
      for (const keyword of keywords) {
        if (baseName.toLowerCase().includes(keyword.toLowerCase())) {
          return category;
        }
      }
    }

    return null;
  }

  // 문서 유형 추출
  extractDocType(filename, baseName) {
    const { destinations } = this.config.rules.docs;

    for (const [category, keywords] of Object.entries(destinations)) {
      for (const keyword of keywords) {
        if (baseName.toLowerCase().includes(keyword.toLowerCase()) ||
            filename.toLowerCase().includes(keyword.toLowerCase())) {
          return category;
        }
      }
    }

    return null;
  }

  // 파일의 대상 경로 결정
  determineTargetPath(filePath) {
    const filename = path.basename(filePath);
    const baseName = path.parse(filename).name;
    const { rules } = this.config;

    for (const [ruleType, rule] of Object.entries(rules)) {
      // 패턴 매칭 확인
      const matches = rule.patterns.some(pattern => {
        // 간단한 glob 패턴 지원
        const regex = new RegExp(
          pattern.replace(/\*/g, '.*').replace(/\?/g, '.')
        );
        return regex.test(filename);
      });

      if (matches) {
        let targetDir = rule.basePath;

        // 세부 분류가 있는 경우 처리
        if (rule.destinations) {
          let subCategory = null;

          if (ruleType === 'components') {
            subCategory = this.extractComponentType(filename, baseName);
          } else if (ruleType === 'docs') {
            subCategory = this.extractDocType(filename, baseName);
          }

          if (subCategory) {
            targetDir = path.join(rule.basePath, subCategory);
          }
        }

        return path.join(this.projectRoot, targetDir, filename);
      }
    }

    return null;
  }

  // 파일 이동 실행
  async moveFile(sourcePath, targetPath) {
    if (this.config.autoMove.dryRun) {
      this.log(`[DRY RUN] ${sourcePath} → ${targetPath}`);
      return;
    }

    try {
      // 대상 디렉토리 생성
      const targetDir = path.dirname(targetPath);
      if (!fs.existsSync(targetDir) && this.config.autoMove.createFolders) {
        fs.mkdirSync(targetDir, { recursive: true });
        this.log(`디렉토리 생성: ${targetDir}`);
      }

      // 파일이 이미 존재하는지 확인
      if (fs.existsSync(targetPath)) {
        this.log(`❌ 파일 이동 실패 - 대상 파일이 이미 존재: ${targetPath}`);
        return;
      }

      // 파일 이동
      fs.renameSync(sourcePath, targetPath);
      this.log(`✅ 파일 이동 완료: ${path.relative(this.projectRoot, sourcePath)} → ${path.relative(this.projectRoot, targetPath)}`);

      // import 경로 업데이트 (별도 처리)
      await this.updateImportPaths(sourcePath, targetPath);

    } catch (error) {
      this.log(`❌ 파일 이동 실패: ${error.message}`);
    }
  }

  // import 경로 자동 업데이트
  async updateImportPaths(oldPath, newPath) {
    // TODO: 추후 구현 - AST를 사용한 import 경로 자동 업데이트
    this.log(`🔄 Import 경로 업데이트 필요: ${path.relative(this.projectRoot, oldPath)} → ${path.relative(this.projectRoot, newPath)}`);
  }

  // 파일이 무시 경로에 있는지 확인
  shouldIgnoreFile(filePath) {
    const relativePath = path.relative(this.projectRoot, filePath);
    return this.config.ignorePaths.some(ignorePath =>
      relativePath.startsWith(ignorePath)
    );
  }

  // 파일 처리
  async processFile(filePath) {
    // 무시할 파일인지 확인
    if (this.shouldIgnoreFile(filePath)) {
      return;
    }

    // 대상 경로 결정
    const targetPath = this.determineTargetPath(filePath);

    if (targetPath && targetPath !== filePath) {
      await this.moveFile(filePath, targetPath);
    }
  }

  // 프로젝트 전체 스캔
  async scanProject() {
    this.log('🔍 프로젝트 전체 스캔 시작...');

    const scanDir = (dirPath) => {
      const items = fs.readdirSync(dirPath);

      for (const item of items) {
        const itemPath = path.join(dirPath, item);
        const stat = fs.statSync(itemPath);

        if (stat.isDirectory()) {
          if (!this.shouldIgnoreFile(itemPath)) {
            scanDir(itemPath);
          }
        } else {
          this.processFile(itemPath);
        }
      }
    };

    scanDir(this.projectRoot);
    this.log('✅ 프로젝트 스캔 완료');
  }

  // 파일 감시 시작
  startWatching() {
    if (!this.config.autoMove.enabled) {
      this.log('⚠️ 자동 정리가 비활성화되어 있습니다.');
      return;
    }

    this.log('👀 파일 감시 시작...');
    this.isWatching = true;

    const watcher = chokidar.watch(this.projectRoot, {
      ignored: this.config.ignorePaths.map(p => path.join(this.projectRoot, p)),
      persistent: true,
      ignoreInitial: true
    });

    watcher.on('add', (filePath) => {
      this.log(`📁 새 파일 감지: ${path.relative(this.projectRoot, filePath)}`);
      this.processFile(filePath);
    });

    watcher.on('error', (error) => {
      this.log(`❌ 파일 감시 오류: ${error.message}`);
    });

    // Graceful shutdown
    process.on('SIGINT', () => {
      this.log('⏹️  파일 감시 중지...');
      watcher.close();
      process.exit(0);
    });
  }

  // 프로젝트 구조 검증
  validateStructure() {
    this.log('🔍 프로젝트 구조 검증 중...');

    const { rules } = this.config;
    const issues = [];

    for (const [ruleType, rule] of Object.entries(rules)) {
      const basePath = path.join(this.projectRoot, rule.basePath);

      if (!fs.existsSync(basePath)) {
        issues.push(`❌ 필수 디렉토리 누락: ${rule.basePath}`);
        continue;
      }

      // 해당 유형의 파일이 올바른 위치에 있는지 확인
      this.validateRuleCompliance(rule, ruleType, issues);
    }

    if (issues.length === 0) {
      this.log('✅ 프로젝트 구조가 올바릅니다!');
    } else {
      this.log('⚠️ 프로젝트 구조 문제 발견:');
      issues.forEach(issue => this.log(`  ${issue}`));
    }

    return issues.length === 0;
  }

  validateRuleCompliance(rule, ruleType, issues) {
    // 전체 프로젝트에서 해당 패턴의 파일들을 찾아 위치 검증
    const findFiles = (dirPath, files = []) => {
      if (this.shouldIgnoreFile(dirPath)) return files;

      try {
        const items = fs.readdirSync(dirPath);

        for (const item of items) {
          const itemPath = path.join(dirPath, item);
          const stat = fs.statSync(itemPath);

          if (stat.isDirectory()) {
            findFiles(itemPath, files);
          } else {
            // 패턴 매칭
            const matches = rule.patterns.some(pattern => {
              const regex = new RegExp(
                pattern.replace(/\*/g, '.*').replace(/\?/g, '.')
              );
              return regex.test(item);
            });

            if (matches) {
              files.push(itemPath);
            }
          }
        }
      } catch (error) {
        // 권한 없는 디렉토리 등은 무시
      }

      return files;
    };

    const matchingFiles = findFiles(this.projectRoot);
    const basePath = path.join(this.projectRoot, rule.basePath);

    for (const filePath of matchingFiles) {
      if (!filePath.startsWith(basePath)) {
        const relativePath = path.relative(this.projectRoot, filePath);
        issues.push(`❌ 잘못된 위치의 ${ruleType} 파일: ${relativePath} (${rule.basePath}에 있어야 함)`);
      }
    }
  }
}

// CLI 인터페이스
if (require.main === module) {
  const organizer = new FileOrganizer();
  const command = process.argv[2];

  switch (command) {
    case 'scan':
      organizer.scanProject();
      break;
    case 'watch':
      organizer.startWatching();
      break;
    case 'validate':
      organizer.validateStructure();
      break;
    case 'help':
    default:
      console.log(`
파일 자동 정리 도구

사용법:
  node scripts/file-organizer.js <명령어>

명령어:
  scan      - 프로젝트 전체를 스캔하고 파일들을 정리
  watch     - 파일 변경사항을 감시하고 자동으로 정리
  validate  - 프로젝트 구조가 올바른지 검증
  help      - 도움말 표시

설정 파일: config/file-organization.json
      `);
  }
}

module.exports = FileOrganizer;