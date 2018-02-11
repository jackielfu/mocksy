import React from 'react';
import { connect } from 'react-redux';
import { Row, Col, Select } from 'antd';
import { populateFeedback } from '../../actions/index';

import AppSidebar from './AppSidebar';
import FeedbackList from './FeedbackList';
import PostFeedbackModal from './PostFeedbackModal';
import LoginModal from '../login/LoginModal';

const mapStateToProps = state => (
  {
    project: state.feedback.project,
    auth: state.auth
  }
);

class FeedbackPage extends React.Component {
  constructor() {
    super();
    this.state = {
      selectedValue: 'newest'
    };
    this.handleSort = this.handleSort.bind(this);
  }
  componentDidMount() {
    populateFeedback(this.props.match.params.id);
    this.props.isHomepage(false);
  }

  handleSort(e) {
    console.log(e)
    this.setState({
      selectedValue: e
    }, () => populateFeedback(this.props.project.id, e));
  }

  render() {
    const project = this.props.project;
    return (
      <div>
        <div id="feedback-padding"></div>
        <Row>
          <Col span={2} />
          <Col span={22}>
            <h1>Feedback for {project.title}</h1>
          </Col>
        </Row>
        <Row gutter={48}>
          <Col span={2} />
          <Col span={8}><AppSidebar /></Col>
          <Col span={12}>
            { this.props.auth ?
              <PostFeedbackModal id={this.props.match.params.id} title={this.props.project.title} userid={this.props.project['user_id']} /> :
              <LoginModal />
            }
            <Select
              value={this.state.selectedValue}
              style={{ width: 200 }}
              placeholder="Sort by"
              onChange={(e) => this.handleSort(e)}
            >
              <Select.Option value="newest">Newest</Select.Option>
              <Select.Option value="upvoted">Most upvoted</Select.Option>
              <Select.Option value="downvoted">Most downvoted</Select.Option>
              <Select.Option value="controversial">Most controversial</Select.Option>
            </Select>
            <br /><br /><br />
            <FeedbackList />
          </Col>
          <Col span={2} />
        </Row>
      </div>
    );
  }
}

export default connect(mapStateToProps)(FeedbackPage);
