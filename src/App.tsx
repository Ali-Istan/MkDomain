import { Provider } from 'react-redux';
import { store } from './store/store';


import { ConfigProvider } from 'antd';
import AppRoutes from './Routes/routes';
import { BrowserRouter } from 'react-router-dom';
function App() {
  return (
    <Provider store={store}>
      <ConfigProvider direction="ltr">
        <BrowserRouter>
        <AppRoutes />
        </BrowserRouter>
      </ConfigProvider>
    </Provider>
  );
}

export default App;
