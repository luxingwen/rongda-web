import { createDepositAgreement } from '@/services/sales_order';
import {
  ClearOutlined,
  EditOutlined,
  LeftOutlined,
  RightOutlined,
} from '@ant-design/icons';
import { PageContainer } from '@ant-design/pro-components';
import { useResizeObserver } from '@wojtekmaj/react-hooks';
import { Button, Form, Input, Layout, message, Modal } from 'antd';
import React, { useCallback, useRef, useState } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';
import 'react-pdf/dist/esm/Page/TextLayer.css';
import { useParams } from 'react-router-dom';
import { history } from '@umijs/max';
import './ContractSigning.css';

pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

const { Content } = Layout;
const options = {
  cMapUrl: '/cmaps/',
  standardFontDataUrl: '/standard_fonts/',
};
const resizeObserverOptions = {};

const ContractSigning = () => {
  const [file, setFile] = useState(null);
  const [numPages, setNumPages] = useState(null);
  const [signPositions, setSignPositions] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [currentPosition, setCurrentPosition] = useState(null);
  const [containerRef, setContainerRef] = useState(null);
  const [containerWidth, setContainerWidth] = useState(null);
  const [isAddingSign, setIsAddingSign] = useState(false);
  const [pageIndex, setPageIndex] = useState(0);
  const pageRefs = useRef([]);
  const [contractTitle, setContractTitle] = useState('');
  const [isSaveModalVisible, setSaveModalVisible] = useState(false);
  const { orderNo } = useParams();

  const onResize = useCallback((entries) => {
    const [entry] = entries;
    if (entry) {
      setContainerWidth(entry.contentRect.width);
    }
  }, []);

  useResizeObserver(containerRef, resizeObserverOptions, onResize);

  function onFileChange(event: React.ChangeEvent<HTMLInputElement>): void {
    const { files } = event.target;
    const nextFile = files?.[0];
    if (nextFile) {
      if (nextFile.type === 'application/pdf') {
        setFile(nextFile);
      } else {
        message.error('请选择PDF文件');
      }
    }
  }

  const onDocumentLoadSuccess = ({ numPages }) => {
    setNumPages(numPages);
  };

  const onClickPDF = (event, pageNumber) => {
    if (isAddingSign && pageRefs.current[pageNumber - 1]) {
      const pageElement = pageRefs.current[pageNumber - 1];
      const rect = pageElement.getBoundingClientRect();
      const scaleX = pageElement.offsetWidth / rect.width;
      const scaleY = pageElement.offsetHeight / rect.height;

      const x = (event.clientX - rect.left) * scaleX;
      const y = (event.clientY - rect.top) * scaleY;
      setCurrentPosition({ x, y, page: pageNumber });
      setModalVisible(true);
      setIsAddingSign(false);
    }
  };

  const handleModalOk = () => {
    setSignPositions([...signPositions, currentPosition]);
    setModalVisible(false);
    message.success('Signature position saved');
  };

  const handleModalCancel = () => {
    setModalVisible(false);
  };

  const handleDrag = (e, ui, index) => {
    const updatedPositions = [...signPositions];
    updatedPositions[index] = {
      ...updatedPositions[index],
      x: updatedPositions[index].x + ui.deltaX,
      y: updatedPositions[index].y + ui.deltaY,
    };
    setSignPositions(updatedPositions);
  };

  const handleAddSignClick = () => {
    setIsAddingSign(true);
  };

  const handleClearLastSign = () => {
    const updatedPositions = [...signPositions];
    updatedPositions.pop();
    setSignPositions(updatedPositions);
    message.success('Last signature position cleared');
  };

  const handlePreviousPage = () => {
    setPageIndex((prevIndex) => Math.max(prevIndex - 1, 0));
  };

  const handleNextPage = () => {
    setPageIndex((prevIndex) => Math.min(prevIndex + 1, numPages - 1));
  };

  const showSaveModal = () => {
    setSaveModalVisible(true);
  };

  const handleSave = () => {
  

    const formData = new FormData();
    formData.append('title', contractTitle);
    formData.append('file', file);
    formData.append('order_no', orderNo);
    formData.append('signature_position_list', JSON.stringify(signPositions));

    createDepositAgreement(formData).then((res) => {
      if (res.code === 200) {
        message.success('合同保存成功');
        history.push('/sales/order');
      } else {
        message.error('合同保存失败');
      }
    });

    setSaveModalVisible(false);
  };

  const handleCancelSave = () => {
    setSaveModalVisible(false);
  };

  return (
    <PageContainer>
      <Content className="content">
        <Form layout="vertical">
          <Form.Item>
            <input onChange={onFileChange} type="file" accept=".pdf" />
          </Form.Item>
          {file && (
            <div>
              <div
                ref={setContainerRef}
                className="pdf-container"
                style={{ cursor: isAddingSign ? 'crosshair' : 'pointer' }}
              >
                <Document
                  file={file}
                  onLoadSuccess={onDocumentLoadSuccess}
                  options={options}
                >
                  <div
                    key={`page_${pageIndex + 1}`}
                    className="pdf-page"
                    onClick={(event) => onClickPDF(event, pageIndex + 1)}
                    ref={(el) => (pageRefs.current[pageIndex] = el)}
                    style={{ position: 'relative' }}
                  >
                    <Page pageNumber={pageIndex + 1} />
                    {signPositions
                      .filter((pos) => pos.page === pageIndex + 1)
                      .map((pos, i) => (
                        <div
                          className="signature-box"
                          style={{
                            top: pos.y,
                            left: pos.x,
                            position: 'absolute',
                          }}
                        />
                      ))}
                  </div>
                </Document>
              </div>
              <div className="pdf-controls">
                <Button
                  onClick={handlePreviousPage}
                  icon={<LeftOutlined />}
                  disabled={pageIndex === 0}
                >
                  上一页
                </Button>
                <Button
                  onClick={handleNextPage}
                  icon={<RightOutlined />}
                  disabled={pageIndex === numPages - 1}
                >
                  下一页
                </Button>
              </div>
            </div>
          )}
          <Form.Item>
            <Button onClick={handleAddSignClick} icon={<EditOutlined />}>
              添加签署位置
            </Button>
            <Button
              onClick={handleClearLastSign}
              icon={<ClearOutlined />}
              style={{ marginLeft: '10px' }}
            >
              清除最近的签署位置
            </Button>
          </Form.Item>
          <Form.Item>
            <Button onClick={showSaveModal} type="primary">
              保存合同
            </Button>
          </Form.Item>
          <Modal
            title="选择签名位置"
            visible={modalVisible}
            onOk={handleModalOk}
            onCancel={handleModalCancel}
          >
            <div style={{ textAlign: 'center' }}>
              <p>
                签名位置：X: {currentPosition?.x}, Y: {currentPosition?.y}
              </p>
            </div>
          </Modal>
          <Modal
            title="保存合同"
            visible={isSaveModalVisible}
            onOk={handleSave}
            onCancel={handleCancelSave}
          >
            <Input
              placeholder="请输入合同标题"
              value={contractTitle}
              onChange={(e) => setContractTitle(e.target.value)}
            />
          </Modal>
        </Form>
      </Content>
    </PageContainer>
  );
};

export default ContractSigning;
