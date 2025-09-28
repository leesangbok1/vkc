#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

class SimpleValidator {
  constructor() {
    this.projectRoot = process.cwd();
    this.requiredDirs = [
      'src/components',
      'src/pages',
      'src/services',
      'src/utils',
      'src/config',
      'docs',
      'scripts',
      'config'
    ];
  }

  log(level, message) {
    const prefix = {
      success: '✅',
      warning: '⚠️',
      error: '❌',
      info: 'ℹ️'
    };
    console.log(`${prefix[level]} ${message}`);
  }

  validateDirectories() {
    this.log('info', '디렉토리 구조 검증 중...');

    const missing = [];
    const existing = [];

    for (const dir of this.requiredDirs) {
      const fullPath = path.join(this.projectRoot, dir);
      if (fs.existsSync(fullPath)) {
        existing.push(dir);
      } else {
        missing.push(dir);
      }
    }

    if (missing.length === 0) {
      this.log('success', '모든 필수 디렉토리가 존재합니다!');
    } else {
      this.log('warning', '누락된 디렉토리:');
      missing.forEach(dir => this.log('error', `  ${dir}`));
    }

    return { missing, existing };
  }

  validateFileStructure() {
    this.log('info', '파일 구조 검증 중...');

    const issues = [];

    try {
      // src 디렉토리 스캔
      const srcDir = path.join(this.projectRoot, 'src');
      if (fs.existsSync(srcDir)) {
        this.scanDirectory(srcDir, issues);
      }
    } catch (error) {
      this.log('error', `파일 구조 검증 실패: ${error.message}`);
    }

    if (issues.length === 0) {
      this.log('success', '파일 구조가 올바릅니다!');
    } else {
      this.log('warning', '발견된 문제들:');
      issues.forEach(issue => this.log('error', `  ${issue}`));
    }

    return issues;
  }

  scanDirectory(dirPath, issues) {
    try {
      const items = fs.readdirSync(dirPath);

      for (const item of items) {
        const itemPath = path.join(dirPath, item);
        const stat = fs.statSync(itemPath);
        const relativePath = path.relative(this.projectRoot, itemPath);

        if (stat.isFile()) {
          // JSX 컴포넌트가 src/components 밖에 있는지 확인
          if (item.endsWith('.jsx') && /^[A-Z]/.test(item)) {
            if (!relativePath.startsWith('src/components/')) {
              issues.push(`컴포넌트 파일이 잘못된 위치: ${relativePath} (src/components/에 있어야 함)`);
            }
          }

          // 페이지 파일 확인
          if (item.includes('Page.jsx') || item.includes('View.jsx')) {
            if (!relativePath.startsWith('src/pages/')) {
              issues.push(`페이지 파일이 잘못된 위치: ${relativePath} (src/pages/에 있어야 함)`);
            }
          }

          // 서비스 파일 확인
          if ((item.includes('Service.js') || item.includes('API.js') || item.includes('api.js')) && !item.includes('test')) {
            if (!relativePath.startsWith('src/services/')) {
              issues.push(`서비스 파일이 잘못된 위치: ${relativePath} (src/services/에 있어야 함)`);
            }
          }
        } else if (stat.isDirectory() && !this.shouldIgnoreDir(itemPath)) {
          this.scanDirectory(itemPath, issues);
        }
      }
    } catch (error) {
      // 권한 없는 디렉토리는 무시
    }
  }

  shouldIgnoreDir(dirPath) {
    const ignorePaths = ['node_modules', '.git', 'dist', 'build', '.next', 'coverage'];
    const relativePath = path.relative(this.projectRoot, dirPath);
    return ignorePaths.some(ignorePath => relativePath.includes(ignorePath));
  }

  runValidation() {
    console.log('\n🔍 프로젝트 구조 검증 시작...\n');

    const dirResults = this.validateDirectories();
    const fileResults = this.validateFileStructure();

    console.log('\n📊 검증 결과 요약:');

    const totalIssues = dirResults.missing.length + fileResults.length;

    if (totalIssues === 0) {
      this.log('success', '프로젝트 구조가 완벽합니다! 🎉');
    } else {
      this.log('warning', `총 ${totalIssues}개의 문제가 발견되었습니다.`);

      if (dirResults.missing.length > 0) {
        console.log('\n수정 명령어:');
        dirResults.missing.forEach(dir => {
          console.log(`  mkdir -p ${dir}`);
        });
      }

      if (fileResults.length > 0) {
        console.log('\n파일 정리 권장:');
        console.log('  npm run organize');
      }
    }

    return totalIssues === 0;
  }
}

// CLI 인터페이스
if (require.main === module) {
  const validator = new SimpleValidator();
  const command = process.argv[2] || 'full';

  switch (command) {
    case 'dirs':
      validator.validateDirectories();
      break;
    case 'files':
      validator.validateFileStructure();
      break;
    case 'full':
    default:
      validator.runValidation();
      break;
  }
}

module.exports = SimpleValidator;