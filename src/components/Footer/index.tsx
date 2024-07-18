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
          key: ' Rongda Sc',
          title: ' Rongda Sc',
          href: 'http://www.rongdasc.com/',
          blankTarget: true,
        }
      ]}
    />
  );
};

export default Footer;
