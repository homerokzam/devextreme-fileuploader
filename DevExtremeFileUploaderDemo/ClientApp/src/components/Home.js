import React, { useState, useRef, useEffect } from 'react';
import { FileUploader, DataGrid, LoadPanel, TextBox, Button } from 'devextreme-react';
import Toolbar, { Item } from 'devextreme-react/toolbar';
import { FilterRow, Scrolling, Column } from 'devextreme-react/data-grid';
import ArrayStore from 'devextreme/data/array_store';

import { confirm } from 'devextreme/ui/dialog';
import notify from 'devextreme/ui/notify';
import saveAs from 'file-saver';

import { getUploadUrl, getDocumentos, getDocumento, deleteDocumento } from '../services/documentosServico';
import { Col } from 'devextreme-react/responsive-box';

const Home = (props) => {

  const ChunkSizeDefault = 5242880;
  const storeVazia = new ArrayStore({ key: "oid", data: [] });

  const [empresaId, SetEmpresaId] = useState(1);
  const [chunkSize, SetChunkSize] = useState(ChunkSizeDefault);

  const refLoading = useRef();
  const refDataGrid = useRef();
  const [dataSource, setDataSource] = useState(storeVazia);

  const refFileUploader = useRef();
  const [chunks, setChunks] = useState({});

  const [uploadUrl, setUploadUrl] = useState(getUploadUrl(empresaId, chunks));

  let didCancel = false;

  useEffect(() => {
    didCancel = false;

    fetchData(empresaId, true);

    return () => {
      didCancel = true;
    }
  }, [empresaId]);

  const fetchData = async (empresaId) => {
    try {
      refLoading.current.instance.show();

      setDataSource([]);

      const dados = await getDocumentos(empresaId);
      console.log(dados);

      if (!didCancel) {
        const store = new ArrayStore({ key: "id", data: dados.data });
        setDataSource(store);
  
        refLoading.current.instance.hide();
      }  
    }
    catch (ex) {
      if (!didCancel) {
        refLoading.current.instance.hide();
        notify(ex.response ? ex.response.data : "Problema na comunicação com o servidor!", "error", 5000);
      }
    }
  }

  const handleOnClickRefresh = (e) => {
    fetchData(empresaId);
  }
  
  const handleOnValueChangedEmpresaId = (e) => {
    SetEmpresaId(e.value);
  }

  const handleOnValueChanged = (e) => {
    console.log("handleOnValueChanged", e);
    if (e.value.length > 0) {
      const file = e.value[0];
      if (file.size < ChunkSizeDefault)
        SetChunkSize(file.size - 1024);
    }
  }

  const handleOnUploadStarted = (e) => {
    console.log("handleOnUploadStarted", e);
    // window.temp1 = refFileUploader;

    const chunk = {};
    setUploadUrl(getUploadUrl(empresaId, chunk));
    setChunks(chunk);
  }

  const handleOnProgress = (e) => {
    console.log("handleOnProgress", e);

    const chunk = {
      filename: e.file.name,
      segmentSize: e.segmentSize,
      bytesLoaded: e.bytesLoaded,
      bytesTotal: e.bytesTotal
    };
    setUploadUrl(getUploadUrl(empresaId, chunk));
    setChunks(chunk);
  }

  const handleOnUploaded = (e) => {
    console.log("handleOnUploaded", e);
    const dados = e.request.responseText;

    dataSource.push([{ type: "insert", data: {dados} }]);
    refDataGrid.current.instance.refresh();

    SetChunkSize(ChunkSizeDefault);
  }

  const handleDownloadIconClick = (e) => {
    console.log(e);
    const req = getDocumento(empresaId, e.row.data.id);
    req.then(response => {
      console.log(e);
      var filename = `${e.row.data.text}`;

      var blob = new Blob([response.data]);
      saveAs(blob, filename);
    });
  }

  const handleDeleteIconClick = (e) => {
    const data = e.row.data;
    var result = confirm(`Deseja excluir documento (${data.text})?`, "Confirmar exclusão");
    result.done(async (dialogResult) => {
      if (dialogResult) {
          refLoading.current.instance.show().done(async () => {
            try {
              await deleteDocumento(empresaId, data.id);

              dataSource.remove(data.id);
  
              refLoading.current.instance.hide();
              notify("Documento excluído com sucesso!", "success", 5000);
  
              refDataGrid.current.instance.refresh();
            } catch (ex) {
              refLoading.current.instance.hide();
              notify(ex.response ? ex.response.data : "Problema na comunicação com o servidor!", "error", 5000);
            }      
          });
      }
    });
  }

  return (
<div style={{ padding: '20px' }}>
  <Toolbar style={{ backgroundColor: 'orange' }}>
    <Item location={'before'}><Button icon={'refresh'} onClick={handleOnClickRefresh} /></Item>
    <Item location={'before'}><div className='toolbar-label'><b>FileUploader - Demo</b></div></Item>
  </Toolbar>
  <LoadPanel ref={refLoading} defaultVisible={false} message={'Processando ...'} />
  <TextBox value={empresaId} onValueChanged={handleOnValueChangedEmpresaId} />
  <FileUploader ref={refFileUploader} name={'file'} selectButtonText='Arquivo'
    accept={'.xlsx, .doc, .pdf, .bak, .zip'} allowedFileExtensions={['.xlsx', '.doc', '.pdf', '.bak', '.zip']} 
    multiple={false} uploadMode={'instantly'} uploadUrl={uploadUrl} maxFileSize={524288000} chunkSize={chunkSize}
    onValueChanged={handleOnValueChanged}
    onUploadStarted={handleOnUploadStarted}
    onProgress={handleOnProgress}
    onUploaded={handleOnUploaded} />

  <DataGrid ref={refDataGrid} style={{ padding: '5px' }} dataSource={dataSource} allowColumnReordering={true} showBorders={true} >
    <FilterRow visible={true} />
    <Scrolling mode='infinite' />

    <Column type={'buttons'} width={'70px'}
        buttons={[{
          hint: 'Download',
          icon: 'download',
          onClick: handleDownloadIconClick
          }, {
            hint: 'Excluir',
            icon: 'trash',
            onClick: handleDeleteIconClick
          }]} />
    <Column dataField={'id'} visible={false} />
    <Column dataField={'text'} caption={'Arquivo'} sortIndex={0} sortOrder={'asc'} />
  </DataGrid>
</div>
  );
}

export default Home;