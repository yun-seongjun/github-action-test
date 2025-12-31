const fs = require('fs');
const path = require('path');

// src 폴더의 경로
const directoryPath = path.join(__dirname, 'src');

// 파일을 삭제하는 함수
function deleteFiles(directory) {
  fs.readdir(directory, (err, files) => {
    if (err) {
      console.error('디렉토리를 읽는 데 오류가 발생했습니다:', err);
      return;
    }

    files.forEach((file) => {
      const filePath = path.join(directory, file);
      fs.stat(filePath, (err, stats) => {
        if (err) {
          console.error('파일 정보를 가져오는 데 오류가 발생했습니다:', err);
          return;
        }

        // 폴더가 아닌 .js 또는 .jsx 파일인 경우 삭제
        if (stats.isFile() && (file.endsWith('.js') || file.endsWith('.jsx'))) {
          fs.unlink(filePath, (err) => {
            if (err) {
              console.error('파일을 삭제하는 데 오류가 발생했습니다:', err);
            } else {
              console.log(`파일이 삭제되었습니다: ${filePath}`);
            }
          });
        }
        // 하위 폴더가 있으면 재귀적으로 삭제
        else if (stats.isDirectory()) {
          deleteFiles(filePath);
        }
      });
    });
  });
}

// 파일 삭제 실행
deleteFiles(directoryPath);
