import { useState } from 'react';
import Axios from 'axios';

export type useDownloadProps = {
  downloadURL: string;
  fileName?: string;
  fileExtension?: string;
};

export const extractFileNameAndExtension = (urlString: string) => {
  try {
    const url = new URL(urlString);
    const paths = url.pathname.split('/');
    const lastPath = paths[paths.length - 1];
    const [fileName, fileExtension] = lastPath.split('.');
    const trimmedFileName = fileName?.trim();
    const trimmedFileExtension = fileExtension?.trim();
    // 파일이름이 한글인 경우 decoding을 하지 않으면 파일명이 인코딩된 상태로 나옴
    const parsedFileName = decodeURI(trimmedFileName);
    return { parsedFileName, trimmedFileExtension };
  } catch (error) {
    return { parsedFileName: undefined, parsedFileExtension: undefined };
  }
};

const useDownload = () => {
  const [isDownloading, setIsDownloading] = useState(false);

  // 다운로드할 파일의 링크를 넘겨주면 곧바로 다운로드가 실행된다
  const downloadFile = async ({
    downloadURL,
    fileName,
    fileExtension,
  }: useDownloadProps) => {
    try {
      setIsDownloading(true);
      const response = await Axios.get<Blob>(downloadURL, {
        responseType: 'blob',
      });
      const blob = response.data;
      const linkAnchor = document.createElement('a'); // 파일 다운로드용 임시 <a>태그
      const { parsedFileName, parsedFileExtension } =
        extractFileNameAndExtension(downloadURL); // 파일명, 확장자명 추출
      linkAnchor.href = URL.createObjectURL(blob);
      linkAnchor.download = `${fileName || parsedFileName || 'Unknown'}.${fileExtension || parsedFileExtension || ''}`; // 다운로드될 파일이름 정의(인자로 받은 파일명, 확장자명을 우선 적용한다)
      linkAnchor.click();
      linkAnchor.remove();
    } catch {
      alert('다운로드 과정중에 오류가 발생하였습니다');
    } finally {
      setIsDownloading(false);
    }
  };

  return { downloadFile, isDownloading };
};

export default useDownload;
