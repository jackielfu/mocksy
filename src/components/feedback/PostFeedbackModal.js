import React from 'react';
import { Modal, Select, Input, Button, message } from 'antd';
import axios from 'axios';

class PostFeedbackModal extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      visible: false,
      feedbackType: 0,
      text: '',
      confirmLoading: false,
    };

    this.showModal = this.showModal.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleCancel = this.handleCancel.bind(this);
    this.handleType = this.handleType.bind(this);
    this.textChange = this.textChange.bind(this);
  }

  /******* MODAL FUNCTIONS ********/
  showModal() {
    this.setState({ visible: true });
  }

  handleSubmit() {
    if (!this.state.feedbackType) {
      message.error('Please select a feedback option');
    } else if (this.state.text === '') {
      message.error('Please provide feedback');
    } else {
      axios.post('/api/feedback', 
        {
          text: this.state.text,
          type: this.state.feedbackType,
          projectId: this.props.id
        })
        .then(() => {
          console.log('form added');
        });
      this.setState({
        visible: false,
        confirmLoading: true
      });
      setTimeout(() => {
        this.setState({
          visible: false,
          confirmLoading: false
        });
      }, 2000);
    }
  }

  handleCancel() {
    this.setState({
      visible: false,
    });
  }

  textChange(input) {
    this.setState({
      text: input.target.value
    });
  }

  /********** DROPDOWN FUNCTIONS **********/
  handleType(value) {
    this.setState({ feedbackType: value });
  }

  render() {
    return (
      <div className="modal">
        <Button
          type="primary"
          onClick={this.showModal}
        >Post feedback
        </Button>

        <Modal
          title="Post feedback"
          visible={this.state.visible}
          confirmLoading={this.state.confirmLoading}
          onOk={this.handleSubmit}
          onCancel={this.handleCancel}
          footer={[
            <Button key="Cancel" onClick={this.handleCancel}>Cancel</Button>,
            <Button key="Submit" type="primary" onClick={this.handleSubmit}>Submit</Button>,
          ]}
        >
          <form onSubmit={this.handleSubmit}>
            <h4>What kind of feedback are you leaving?</h4>
            <Select
              style={{ width: 300 }}
              placeholder="Select feedback type"
              onChange={this.handleType}
            >
              <Select.Option value={1}>General feedback</Select.Option>
              <Select.Option value={2}>Feature suggestion</Select.Option>
              <Select.Option value={3}>Bug fixes</Select.Option>
              <Select.Option value={4}>Dependency recommendation</Select.Option>
              <Select.Option value={5}>Code review</Select.Option>
              <Select.Option value={6}>Design critique</Select.Option>
              <Select.Option value={7}>Other...</Select.Option>
            </Select>

            <br /><br />
            <h4>Say something constructive about this app:</h4>
            <Input.TextArea rows={8} onChange={this.textChange} />
          </form>
        </Modal>
      </div>
    );
  }
}

export default PostFeedbackModal;
