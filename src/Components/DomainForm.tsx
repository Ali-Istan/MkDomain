import React from 'react';
import { Form, Input, Button, Switch, message } from 'antd';
import { useAddDomainMutation } from '../store/domainApi';
import type { Domain } from '../store/domainApi';

interface DomainFormProps {
  initialValues?: Domain | null;
  onSuccess?: (values: { domain: string; isActive: boolean }) => void;
  onCancel: () => void;
}

const DomainForm: React.FC<DomainFormProps> = ({ initialValues, onSuccess, onCancel }) => {
  const [form] = Form.useForm();
  const [addDomain] = useAddDomainMutation();

  React.useEffect(() => {
    if (initialValues) {
      form.setFieldsValue({
        domain: initialValues.domain,
        isActive: initialValues.isActive,
      });
    }
  }, [initialValues, form]);

  const onFinish = async (values: { domain: string; isActive: boolean }) => {
    if (onSuccess) {
      onSuccess(values);
      return;
    }

    try {
      await addDomain({
        domain: values.domain,
        status: 'pending',
        isActive: values.isActive,
        createdDate: Math.floor(Date.now() / 1000),
      }).unwrap();
      message.success('Domain added successfully');
      form.resetFields();
      onCancel();
    } catch (error) {
      console.error(error);
      message.error('Failed to add domain');
    }
  };

  return (
    <Form
      form={form}
      layout="vertical"
      onFinish={onFinish}
      className="mt-4"
      initialValues={{
        isActive: true,
      }}
    >
      <Form.Item
        name="domain"
        label="Domain URL"
        rules={[
          { required: true, message: 'Please input the domain!' },
          { 
            pattern: /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/, 
            message: 'Please enter a valid domain URL!' 
          },
        ]}
      >
        <Input 
          placeholder="Ex: https://google.com" 
          size="large"
          className="rounded"
        />
      </Form.Item>

      <Form.Item
        name="isActive"
        label="Active Status"
        valuePropName="checked"
      >
        <Switch />
      </Form.Item>

      <div className="flex justify-end gap-2 mt-6">
        <Button onClick={onCancel}>
          Cancel
        </Button>
        <Button type="primary" htmlType="submit">
          {initialValues ? 'Update' : 'Add'}
        </Button>
      </div>
    </Form>
  );
};

export default DomainForm; 