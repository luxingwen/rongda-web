import { GithubOutlined } from '@ant-design/icons';
import { DefaultFooter } from '@ant-design/pro-components';
import React from 'react';

const Footer: React.FC = () => {
  return (
    <DefaultFooter
      style={{
        background: 'none',
      }}
      copyright="Powered by Rongda Sc"
      links={[
        {
          key: ' 滇ICP备2024035977号-1',
          title: '滇ICP备2024035977号-1',
          href: 'https://beian.miit.gov.cn/#/Integrated/index',
          blankTarget: true,
        }
      ]}
    />
  );
};

export default Footer;
