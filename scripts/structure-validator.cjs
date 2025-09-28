#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

class StructureValidator {
  constructor() {
    this.projectRoot = process.cwd();
    this.configPath = path.join(this.projectRoot, 'config/file-organization.json');
    this.config = this.loadConfig();
    this.requiredDirs = [
      'src/components/auth',
      'src/components/layout',
      'src/components/common',
      'src/components/questions',
      'src/pages',
      'src/services',
      'src/utils',
      'src/config',
      'src/hooks',
      'src/styles',
      'src/assets',
      'docs',
      'scripts',
      'config'
    ];
  }

  loadConfig() {
    try {
      return JSON.parse(fs.readFileSync(this.configPath, 'utf8');
    } catch (error) {
      console.error('❌ Config 파일을 로드할 수 없습니다:', error.message);
      return null;
    }
  }

  // 로그
  log(level, message, detail = '') {
    const prefix = {
      success: '✅',
      warning: '⚠️',
      error: '❌',
      info: 'ℹ️'
    };

    console.log(`${prefix[level]} ${message} ${detail}`);
  }

  // 필수 디렉토리 구조 검증
  validateDirectoryStructure() {
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
      missing.forEach(dir => this.log('error', `  ${dir}`);
    }

    return { missing, existing };
  }

  // 파일 위치 검증
  validateFileLocations() {
    this.log('info', '파일 위치 검증 중...');

    const misplacedFiles = [];
    const { rules } = this.config;

    for (const [ruleType, rule] of Object.entries(rules)) {
      const violations = this.findLocationViolations(rule, ruleType);
      misplacedFiles.push(...violations);
    }

    if (misplacedFiles.length === 0) {
      this.log('success', '모든 파일이 올바른 위치에 있습니다!');
    } else {
      this.log('warning', '잘못된 위치의 파일들:');
      misplacedFiles.forEach(file => {
        this.log('error', `  ${file.path}`, `(${file.expectedLocation}에 있어야 함)`);
      });
    }

    return misplacedFiles;
  }

  findLocationViolations(rule, ruleType) {
    const violations = [];
    const basePath = path.join(this.projectRoot, rule.basePath);

    // 전체 프로젝트에서 해당 패턴의 파일들을 찾기
    const findFiles = (dirPath) => {
      if (this.shouldIgnoreDir(dirPath)) return [];

      let files = [];
      try {
        const items = fs.readdirSync(dirPath);

        for (const item of items) {
          const itemPath = path.join(dirPath, item);
          const stat = fs.statSync(itemPath);

          if (stat.isDirectory()) {
            files.push(...findFiles(itemPath);
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
        // 권한 없는 디렉토리는 무시
      }

      return files;
    };

    const matchingFiles = findFiles(this.projectRoot);

    for (const filePath of matchingFiles) {
      // 올바른 위치에 있는지 확인
      if (!filePath.startsWith(basePath)) {
        violations.push({
          path: path.relative(this.projectRoot, filePath),
          expectedLocation: rule.basePath,
          type: ruleType
        });
      }
    }

    return violations;
  }

  shouldIgnoreDir(dirPath) {
    const relativePath = path.relative(this.projectRoot, dirPath);
    return this.config.ignorePaths.some(ignorePath =>
      relativePath.startsWith(ignorePath)
    );
  }

  // Import 경로 검증
  validateImportPaths() {
    this.log('info', 'Import 경로 검증 중...');

    const issues = [];
    const jsFiles = this.findJSFiles();

    for (const filePath of jsFiles) {
      const fileIssues = this.checkFileImports(filePath);
      issues.push(...fileIssues);
    }

    if (issues.length === 0) {
      this.log('success', 'Import 경로가 모두 올바릅니다!');
    } else {
      this.log('warning', 'Import 경로 문제:');
      issues.forEach(issue => {
        this.log('error', `  ${issue.file}:${issue.line}`, issue.message);
      });
    }

    return issues;
  }

  findJSFiles() {
    const files = [];

    const scan = (dirPath) => {
      if (this.shouldIgnoreDir(dirPath)) return;

      try {
        const items = fs.readdirSync(dirPath);

        for (const item of items) {
          const itemPath = path.join(dirPath, item);
          const stat = fs.statSync(itemPath);

          if (stat.isDirectory()) {
            scan(itemPath);
          } else if (/\.(js|jsx|ts|tsx)$/.test(item)) {
            files.push(itemPath);
          }
        }
      } catch (error) {
        // 무시
      }
    };

    scan(path.join(this.projectRoot, 'src');
    return files;
  }

  checkFileImports(filePath) {
    const issues = [];

    try {
      const content = fs.readFileSync(filePath, 'utf8');
      const lines = content.split('\n');

      lines.forEach((line, index) => {
        const importMatch = line.match(/import.*from\s+['"]([^'"]+)['"]/);

        if (importMatch) {
          const importPath = importMatch[1];

          // 상대 경로 검증
          if (importPath.startsWith('../')) {
            const depth = (importPath.match(/\.\.\//g) || []).length;
            if (depth > 3) {
              issues.push({
                file: path.relative(this.projectRoot, filePath),
                line: index + 1,
                message: `너무 깊은 상대 경로: ${importPath} (alias 사용 권장)`
              });
            }
          }

          // 존재하지 않는 파일 참조 검증
          if (importPath.startsWith('./') || importPath.startsWith('../')) {
            const resolvedPath = this.resolveImportPath(filePath, importPath);
            if (resolvedPath && !fs.existsSync(resolvedPath)) {
              issues.push({
                file: path.relative(this.projectRoot, filePath),
                line: index + 1,
                message: `존재하지 않는 파일: ${importPath}`
              });
            }
          }
        }
      });
    } catch (error) {
      // 파일 읽기 실패는 무시
    }

    return issues;
  }

  resolveImportPath(fromFile, importPath) {
    if (importPath.startsWith('@')) {
      // alias 경로는 스킵
      return null;
    }

    const fromDir = path.dirname(fromFile);
    let resolvedPath = path.resolve(fromDir, importPath);

    // 확장자가 없으면 .js, .jsx 등을 시도
    if (!path.extname(resolvedPath)) {
      const extensions = ['.js', '.jsx', '.ts', '.tsx'];
      for (const ext of extensions) {
        const withExt = resolvedPath + ext;
        if (fs.existsSync(withExt)) {
          return withExt;
        }
      }

      // index 파일 확인
      const indexPath = path.join(resolvedPath, 'index.js');
      if (fs.existsSync(indexPath)) {
        return indexPath;
      }
    }

    return resolvedPath;
  }

  // 종속성 검증
  validateDependencies() {
    this.log('info', '종속성 검증 중...');

    const packageJsonPath = path.join(this.projectRoot, 'package.json');

    if (!fs.existsSync(packageJsonPath)) {
      this.log('error', 'package.json 파일이 없습니다!');
      return false;
    }

    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8');
    const dependencies = {
      ...packageJson.dependencies,
      ...packageJson.devDependencies
    };

    // 필수 종속성 확인
    const required = ['react', 'react-dom'];
    const recommended = ['chokidar', 'chalk'];

    const missing = required.filter(dep => !dependencies[dep]);
    const missingRecommended = recommended.filter(dep => !dependencies[dep]);

    if (missing.length === 0) {
      this.log('success', '필수 종속성이 모두 설치되어 있습니다!');
    } else {
      this.log('error', '누락된 필수 종속성:', missing.join(', ');
    }

    if (missingRecommended.length > 0) {
      this.log('warning', '권장 종속성 누락:', missingRecommended.join(', ');
    }

    return missing.length === 0;
  }

  // 전체 검증 실행
  runFullValidation() {
    console.log('\n🔍 프로젝트 구조 전체 검증 시작...\n');

    const results = {
      directories: this.validateDirectoryStructure(),
      fileLocations: this.validateFileLocations(),
      importPaths: this.validateImportPaths(),
      dependencies: this.validateDependencies()
    };

    // 요약 리포트
    console.log('\n📊 검증 결과 요약:');

    const totalIssues =
      results.directories.missing.length +
      results.fileLocations.length +
      results.importPaths.length +
      (results.dependencies ? 0 : 1);

    if (totalIssues === 0) {
      this.log('success', '프로젝트 구조가 완벽합니다! 🎉');
    } else {
      this.log('warning', `총 ${totalIssues}개의 문제가 발견되었습니다.`);
      console.log('\n수정 권장사항:');

      if (results.directories.missing.length > 0) {
        console.log('- 누락된 디렉토리를 생성하세요');
      }

      if (results.fileLocations.length > 0) {
        console.log('- 파일을 올바른 위치로 이동하세요 (node scripts/file-organizer.js scan)');
      }

      if (results.importPaths.length > 0) {
        console.log('- Import 경로를 수정하세요');
      }
    }

    return results;
  }

  // 자동 수정 제안
  generateFixCommands() {
    this.log('info', '자동 수정 명령어 생성 중...');

    const commands = [];
    const { missing } = this.validateDirectoryStructure();

    // 누락된 디렉토리 생성 명령어
    for (const dir of missing) {
      commands.push(`mkdir -p ${dir}`);
    }

    // 파일 정리 명령어
    commands.push('node scripts/file-organizer.js scan');

    if (commands.length > 0) {
      console.log('\n🔧 자동 수정 명령어:');
      commands.forEach(cmd => console.log(`  ${cmd}`));
    }

    return commands;
  }
}

// CLI 인터페이스
if (require.main === module) {
  const validator = new StructureValidator();
  const command = process.argv[2];

  switch (command) {
    case 'full':
      validator.runFullValidation();
      break;
    case 'dirs':
      validator.validateDirectoryStructure();
      break;
    case 'files':
      validator.validateFileLocations();
      break;
    case 'imports':
      validator.validateImportPaths();
      break;
    case 'deps':
      validator.validateDependencies();
      break;
    case 'fix':
      validator.generateFixCommands();
      break;
    case 'help':
    default:
      console.log(`
프로젝트 구조 검증 도구

사용법:
  node scripts/structure-validator.js <명령어>

명령어:
  full     - 전체 구조 검증 (기본값)
  dirs     - 디렉토리 구조만 검증
  files    - 파일 위치만 검증
  imports  - Import 경로만 검증
  deps     - 종속성만 검증
  fix      - 자동 수정 명령어 생성
  help     - 도움말 표시
      `);
  }
}

module.exports = StructureValidator;