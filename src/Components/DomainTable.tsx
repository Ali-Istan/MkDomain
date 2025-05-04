import React, { useState } from 'react';
import { Table, Input, Button, Tag, Dropdown, Select, Drawer, message } from 'antd';
import { SearchOutlined, MoreOutlined, CopyOutlined, PlusOutlined, EditOutlined } from '@ant-design/icons';
import { useGetDomainsQuery, useDeleteDomainMutation, useUpdateDomainMutation } from '../store/domainApi';
import type { Domain } from '../store/domainApi';
import type { MenuProps } from 'antd';
import DomainForm from './DomainForm';

const DomainTable: React.FC = () => {
  const [searchText, setSearchText] = useState('');
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [editingDomain, setEditingDomain] = useState<Domain | null>(null);
  const { data: domains = [], isLoading, refetch } = useGetDomainsQuery();
  const [deleteDomain, { isLoading: isDeleting }] = useDeleteDomainMutation();
  const [updateDomain] = useUpdateDomainMutation();

  const showDrawer = (domain?: Domain) => {
    if (domain) {
      setEditingDomain(domain);
    }
    setIsDrawerOpen(true);
  };

  const closeDrawer = () => {
    setIsDrawerOpen(false);
    setEditingDomain(null);
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteDomain(id).unwrap();
      message.success('Domain deleted successfully');
      refetch();
    } catch (error) {
      console.error('Delete error:', error);
      message.error('Failed to delete domain. Please try again.');
    }
  };

  const handleVerify = async (id: string) => {
    try {
      await updateDomain({
        id,
        body: { status: 'verified' }
      }).unwrap();
      message.success('Domain verified successfully');
      refetch();
    } catch (error) {
      console.error('Verification error:', error);
      message.error('Failed to verify domain. Please try again.');
    }
  };

  const handleUpdate = async (values: { domain: string; isActive: boolean }) => {
    if (!editingDomain?.id) {
      message.error('Domain ID is missing');
      return;
    }
    
    try {
      await updateDomain({
        id: editingDomain.id,
        body: {
          domain: values.domain,
          isActive: values.isActive,
        },
      }).unwrap();
      message.success('Domain updated successfully');
      closeDrawer();
      refetch();
    } catch (error) {
      console.error('Update error:', error);
      message.error('Failed to update domain. Please try again.');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'verified':
        return 'success';
      case 'pending':
        return 'warning';
      default:
        return 'error';
    }
  };

  const getStatusIcon = (isActive: boolean) => {
    return isActive ? (
      <span className="w-2 h-2 rounded-full bg-green-500 inline-block mr-2" />
    ) : (
      <span className="w-2 h-2 rounded-full bg-red-500 inline-block mr-2" />
    );
  };

  const getDropdownItems = (record: Domain): MenuProps['items'] => [
    {
      key: `edit-${record.id}`,
      label: 'Edit',
      icon: <EditOutlined />,
      onClick: () => showDrawer(record),
    },
    {
      key: `verify-${record.id}`,
      label: 'Verify',
      disabled: record.status === 'verified',
      onClick: () => handleVerify(record.id),
    },
    {
      key: `delete-${record.id}`,
      label: 'Delete',
      danger: true,
      disabled: isDeleting,
      onClick: () => handleDelete(record.id),
    },
  ];

  const columns = [
    {
      title: 'Domain URL',
      dataIndex: 'domain',
      key: 'domain',
      render: (domain: string, record: Domain) => (
        <div className="flex items-center" key={`domain-${record.id}`}>
          {getStatusIcon(record.isActive)}
          <span>{domain}</span>
          <Button 
            type="text" 
            icon={<CopyOutlined />} 
            className="ml-2"
            onClick={() => {
              navigator.clipboard.writeText(domain);
              message.success('Domain copied to clipboard');
            }}
          />
        </div>
      ),
    },
    {
      title: 'Active Status',
      dataIndex: 'isActive',
      key: 'isActive',
      render: (isActive: boolean, record: Domain) => (
        <Tag color={isActive ? 'success' : 'error'} key={`status-${record.id}`}>
          {isActive ? 'Active' : 'Not Active'}
        </Tag>
      ),
    },
    {
      title: 'Verification status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string, record: Domain) => (
        <Tag color={getStatusColor(status)} key={`verification-${record.id}`}>
          {status.charAt(0).toUpperCase() + status.slice(1)}
        </Tag>
      ),
    },
    {
      title: '',
      key: 'actions',
      width: 50,
      render: (record: Domain) => (
        <Dropdown
          menu={{
            items: getDropdownItems(record),
          }}
          trigger={['click']}
          key={`dropdown-${record.id}`}
        >
          <Button type="text" icon={<MoreOutlined />} />
        </Dropdown>
      ),
    },
  ];

  return (
    <div style={{ width: '100vw', height: '100vh', padding: '20px', overflow: 'hidden' }}>
      <div className="bg-white rounded-lg p-6 shadow-sm" style={{ width: '100%', height: 'calc(100vh - 40px)', display: 'flex', flexDirection: 'column' }}>
        <div className="flex justify-between items-center m-6">
          <h1 className="text-2xl font-semibold">Domains</h1>
          <Button type="primary" icon={<PlusOutlined />} onClick={() => showDrawer()}>
            Add Domain
          </Button>
        </div>
        
        <div className="flex justify-between items-center mb-6">
          <Input
            placeholder="Search"
            prefix={<SearchOutlined />}
            onChange={(e) => setSearchText(e.target.value)}
            style={{ width: 300 }}
            className="mr-4"
          />
          <Select
            defaultValue="asc"
            style={{ width: 200 }}
            options={[
              { value: 'asc', label: 'Order by Ascending' },
              { value: 'desc', label: 'Order by Descending' },
            ]}
          />
        </div>

        <div style={{ flex: 1, overflow: 'auto' }}>
          <Table
            columns={columns}
            dataSource={domains.filter(domain => 
              domain.domain.toLowerCase().includes(searchText.toLowerCase())
            )}
            loading={isLoading}
            rowKey="id"
            pagination={{ pageSize: 10 }}
            style={{ width: '100%', height: '100%' }}
            scroll={{ y: 'calc(100vh - 280px)' }}
          />
        </div>

        <Drawer
          title={editingDomain ? "Edit domain" : "Add domain"}
          placement="left"
          onClose={closeDrawer}
          open={isDrawerOpen}
          width={400}
        >
          <DomainForm 
            initialValues={editingDomain}
            onSuccess={editingDomain ? handleUpdate : undefined}
            onCancel={closeDrawer}
          />
        </Drawer>
      </div>
    </div>
  );
};

export default DomainTable; 