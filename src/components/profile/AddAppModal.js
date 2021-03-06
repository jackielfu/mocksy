import React from 'react';
import { Modal, Button, Input, Tag, Select, Spin, Icon, Tooltip, Form, message, Row, Col } from 'antd';
import axios from 'axios';
import debounce from 'lodash.debounce';
import styled, { css } from 'styled-components';
import Store from '../../actions/index';

class AppsTab extends React.Component {
  constructor(props) {
    super(props);
    this.lastFetchId = 0;
    this.fetchUser = debounce(this.fetchUser, 800);

    this.state = {
      // toggles modal visibility
      visible: false,
      // form data
      appURL: '',
      githubURL: '',
      tags: [],
      title: '',
      description: '',
      // tags
      inputVisible: false,
      inputValue: '',
      // contributors
      data: [],
      value: [],
      fetching: false,
      tempId: '',
      // spinner for submit button (doesn't work)
      confirmLoading: false
    };

    this.fetchUser = this.fetchUser.bind(this);
    this.handleContributorChange = this.handleContributorChange.bind(this);
    this.showModal = this.showModal.bind(this);
    this.handleClose = this.handleClose.bind(this);
    this.handleAppURL = this.handleAppURL.bind(this);
    this.handleInputChange = this.handleInputChange.bind(this);
    this.showInput = this.showInput.bind(this);
    this.handleTagInputChange = this.handleTagInputChange.bind(this);
    this.handleInputConfirm = this.handleInputConfirm.bind(this);
    this.saveInputRef = this.saveInputRef.bind(this);
    this.projectFormSubmit = this.projectFormSubmit.bind(this);
    this.handleCancel = this.handleCancel.bind(this);

    this.changeRoute = {
      appURL: value => this.setState({ appURL: value }),
      githubURL: value => this.setState({ githubURL: value }),
      title: value => this.setState({ title: value }),
      //contributors: value => this.setState({ contributors: value }),
      description: value => this.setState({ description: value })
    };
  }
  
  showModal() {
    this.setState({ visible: true });
  }

  handleInputChange(stateKey, event, index, val) {
    if (val !== undefined) {
      this.changeRoute[stateKey](val);
    } else {
      this.changeRoute[stateKey](event.target.value);
    }
  }

  handleAppURL(e) {
    let url = e.target.value;
    const tempId = `${this.props.name}_${Date.now()}`;
    const regexp = /(^|\s)((https?:\/\/)?[\w-]+(\.[\w-]+)+\.?(:\d+)?(\/\S*)?)/gi;
    if (!(regexp.test(url))) {
      message.error('Not a valid URL');
    } else if (url.includes('herokuapp.com')) {
      message.warning('Please note that Heroku apps may take up to a minute to load!', 10);
    }
    this.setState({
      tempId,
      appURL: url
    });
    if (!url.includes('https://') && !url.includes('http://')) {
      url = `http://${url}`;
    }
    this.updateScreenshot();
    axios.get('/api/screenshot', {
      params: { url, tempId }
    }).then((res) => {
      console.log(res.data);
      this.updateScreenshot(tempId);
    });
  }

  updateScreenshot(fileName) {
    if (fileName) {
      document.getElementById('screenshot-img').src = `/images/apps/new/${fileName}.png`;
    } else {
      document.getElementById('screenshot-img').src = '/images/ui/default_screenshot.png';
    }
  }

  /* *********** CONTRIBUTOR HANDLERS ************ */
  fetchUser(value) {
    console.log('fetching user', value);
    this.lastFetchId += 1;
    const fetchId = this.lastFetchId;
    this.setState({
      data: [],
      fetching: true
    });
    axios(`https://api.github.com/search/users?q=${value}`)
      .then((response) => {
        if (fetchId !== this.lastFetchId) {
          return;
        }
        const data = response.data.items.map(user => ({
          value: user.login
        }));
        this.setState({ data, fetching: false });
      });
  }

  handleContributorChange(value) {
    console.log(this.state.data);
    this.setState({
      value,
      data: [],
      fetching: false
    });
  }

  /* *********** TAG HANDLERS ************ */
  handleClose(removedTag) {
    const tags = this.state.tags.filter(tag => tag !== removedTag);
    this.setState({ tags });
  }

  showInput() {
    this.setState({ inputVisible: true }, () => this.input.focus());
  }

  handleTagInputChange(e) {
    this.setState({ inputValue: e.target.value });
  }

  handleInputConfirm() {
    const { inputValue } = this.state;
    let { tags } = this.state;
    if (inputValue && tags.indexOf(inputValue) === -1) {
      tags = [...tags, inputValue];
    }
    this.setState({
      tags,
      inputVisible: false,
      inputValue: '',
    });
  }

  saveInputRef(input) {
    this.input = input;
  }

  /* *********** FORM SUBMISSION ************ */
  projectFormSubmit(event) {
    event.preventDefault();
    setTimeout(() => {}, 3000);
    const projectData = {
      tempId: this.state.tempId,
      appURL: this.state.appURL,
      githubURL: this.state.githubURL,
      tags: this.state.tags,
      title: this.state.title,
      contributors: this.state.value,
      description: this.state.description,
    };

    if (!projectData.appURL.includes('http')) {
      projectData.appURL = `//${projectData.appURL}`;
    }

    if (this.state.appURL === '') {
      message.error('Please provide a deployed URL to your application');
      return;
    } else if (this.state.title === '') {
      message.error('Please provide a title for your application');
      return;
    } else if (this.state.description === '') {
      message.error('Please provide a description for your application');
      return;
    }
    this.setState({
      confirmLoading: true
    });
    setTimeout(() => {
      this.updateScreenshot();
      this.setState({
        // toggles modal visibility
        visible: false,
        // form data
        appURL: '',
        githubURL: '',
        tags: [],
        title: '',
        description: '',
        // tags
        inputVisible: false,
        inputValue: '',
        // contributors
        data: [],
        value: [],
        fetching: false,
        // spinner for submit button (doesn't work)
        confirmLoading: true
      });
    }, 1000);
    axios.post('/api/project', projectData)
      .then(() => {
        Store.populateUser(this.props.name)
          .then((res) => {
            console.log(res);
          });
      });
  }

  handleCancel() {
    this.setState({
      // toggles modal visibility
      visible: false,
      // form data
      appURL: '',
      githubURL: '',
      tags: [],
      title: '',
      description: '',
      // tags
      inputVisible: false,
      inputValue: '',
      // contributors
      data: [],
      value: [],
      fetching: false,
      // spinner for submit button (doesn't work)
      confirmLoading: false
    });
    axios.delete('screenshot');
    this.updateScreenshot();
  }

  render() {
    return (
      <Wrapper className="user-projects-container">
        <AddProjectButton
          className="users-projects-image"
          onClick={this.showModal}
        >+
        </AddProjectButton>
        <Instructions>Add a project</Instructions>
        <Modal
          title="Post an app"
          width={800}
          visible={this.state.visible}
          confirmLoading={this.state.confirmLoading}
          onOk={this.handleSubmit}
          onCancel={this.handleCancel}
          footer={[
            <Button key="Cancel" onClick={this.handleCancel}>Cancel</Button>,
            <Button key="Submit" type="primary" onClick={this.projectFormSubmit}>Submit</Button>,
          ]}
        >
          <Form onSubmit={this.projectFormSubmit}>
            <Row gutter={16}>
              <Col span={8}>
                <div id="screenshot-wrapper">
                  <img
                    id="screenshot-img"
                    src="/images/ui/default_screenshot.png"
                    alt="app screenshot"
                  />
                </div>
                <Form.Item label="Application URL:">
                  <Input
                    addonBefore="https://"
                    value={this.state.appURL}
                    onChange={(e, i, val) => this.handleInputChange('appURL', e, i, val)}
                    onBlur={this.handleAppURL}
                  />
                </Form.Item>
                <Form.Item label="Github URL (optional):">
                  <Input
                    value={this.state.githubURL}
                    onChange={(e, i, val) => this.handleInputChange('githubURL', e, i, val)}
                  />
                </Form.Item>
                <Form.Item label="Technologies:">
                  {this.state.tags.map((tag, index) => {
                    const isLongTag = tag.length > 20;
                    const tagElem = (
                      <Tag
                        key={tag}
                        closable={index !== 0}
                        afterClose={() => this.handleClose(tag)}
                      >
                        {isLongTag ? `${tag.slice(0, 20)}...` : tag}
                      </Tag>
                    );
                    return isLongTag ? <Tooltip title={tag} key={tag}>{tagElem}</Tooltip> : tagElem;
                  })}
                  {this.state.inputVisible && (
                    <Input
                      ref={this.saveInputRef}
                      type="text"
                      size="small"
                      style={{ width: 78 }}
                      value={this.state.inputValue}
                      onChange={this.handleTagInputChange}
                      onBlur={this.handleInputConfirm}
                      onPressEnter={this.handleInputConfirm}
                    />
                  )}
                  {!this.state.inputVisible && (
                    <Tag
                      onClick={this.showInput}
                      style={{ background: '#fff', borderStyle: 'dashed' }}
                    >
                      <Icon type="plus" /> New Tag
                    </Tag>
                  )}
                </Form.Item>
              </Col>
              <Col span={16}>
                <Form.Item label="Title:">
                  <Input
                    size="large"
                    value={this.state.title}
                    onChange={(e, i, val) => this.handleInputChange('title', e, i, val)}
                  />
                </Form.Item>
                <Form.Item label="Contributors (optional):">
                  <Select
                    mode="multiple"
                    labelInValue
                    value={this.state.value}
                    placeholder="Select users from Github"
                    notFoundContent={this.state.fetching ? <Spin size="small" /> : null}
                    filterOption={false}
                    onSearch={this.fetchUser}
                    onChange={this.handleContributorChange}
                  >
                    {this.state.data.map(d => <Select.Option key={d.value}>{d.value}</Select.Option>)}
                  </Select>
                </Form.Item>
                <Form.Item label="Description:">
                  <Input.TextArea
                    rows={8}
                    value={this.state.description}
                    onChange={(e, i, val) => this.handleInputChange('description', e, i, val)}
                  />
                </Form.Item>
              </Col>
            </Row>
          </Form>
        </Modal>
      </Wrapper>
    );
  }
}

export default (AppsTab);

const Wrapper = styled.div`
  width: 33%;
  height: 300px;
  display: inline-block;
`;

const AddProjectButton = styled.div`
  width: 400px;
  text-align: center;
  height: 200px;
  border: 1px solid black;
  line-height: 200px;
  font-size: 35px;
  margin: auto;
  cursor: pointer;
`;

const Instructions = styled.div`
  margin-top: 20px;
  text-align: center;
  font-size: 16px;
`;

