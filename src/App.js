import React, { useState, useRef, useMemo } from 'reactn';
import logo from './logo.svg';
import './App.css';

import { Button, Template, Form, FileUploader } from 'devextreme-react';
import { SimpleItem, Item, RequiredRule } from 'devextreme-react/form';

function App() {

  const [currentData, setCurrentData] = useState({ nome: null, filename: null });

  const refButtonImportar = useRef();

  const uploadUrl = 'https://js.devexpress.com/Content/Services/upload.aspx';
  console.log(uploadUrl);

  const handleOnUploaded = (e) => {
    setCurrentData({ ...currentData, filename: e.request.responseText });
  }

  const handleOnClickImportar = (e) => {
    console.log("handleOnClickImportar", e);
  }

  const memoizedFileUploader = useMemo(() =>

    <FileUploader selectButtonText='File' accept={'image/*'} multiple={false} uploadMode={'instantly'} uploadUrl={uploadUrl} onUploaded={handleOnUploaded} />

    , [uploadUrl]);

  return (
    <div className="App">
      <Form formData={currentData} labelLocation={'top'} >

        <SimpleItem dataField={'nome'} label={ {text: 'Nome'}} >
          <RequiredRule message={"Nome é obrigatório!"} />
        </SimpleItem>

        <Item template={'fileUploaderTemplate'} />
        <Template name={'fileUploaderTemplate'}>
          { memoizedFileUploader }
        </Template>

        <Item template={'buttonsTemplate'} />
        <Template name={'buttonsTemplate'}>
          <Button ref={refButtonImportar} text={'Importar'} type={'success'} icon={'save'} disabled={!currentData.filename} onClick={handleOnClickImportar} />
        </Template>

      </Form>
    </div>
  );
}

export default App;
