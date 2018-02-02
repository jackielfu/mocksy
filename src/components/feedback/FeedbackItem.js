import React from 'react';
import { Link } from 'react-router-dom';
import { Row, Col, Icon } from 'antd';

class FeedbackItem extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      total: 0,
      upvoteClicked: false,
      downvoteClicked: false
    };

    this.upvote = this.upvote.bind(this);
    this.downvote = this.downvote.bind(this);
  }


  upvote() {
    this.setState({
      total: this.state.total + 1,
      upvoteClicked: true
    });
  }

  downvote() {
    this.setState({
      total: this.state.total - 1,
      downvoteClicked: true
    });
  }

  handleDelete() {
    /* trigger error handling modal */
  }

  render() {
    const item = this.props.item;
    return (
      <div id="feedback-item">
        <Row>
          <Col span={20}>
            <h2>{item.options} by
              <Link to={`/user/${item.name}`}>
                &nbsp;{item.display_name}
              </Link>
            </h2>
          </Col>
          <Col span={1}>
            <h4>{this.state.total}</h4>
          </Col>
          <Col span={1}>
            { !this.state.upvoteClicked ?
              <Icon
                type="up"
                value={1}
                onClick={this.upvote}
              /> :
              <Icon type="up-circle" />
            }
          </Col>
          <Col span={1}>
            { !this.state.downvoteClicked ?
              <Icon
                type="down"
                value={-1}
                onClick={this.downvote}
              /> :
              <Icon type="down-circle" />
            }
          </Col>
          <Col span={1}>
            <Icon
              type="close-circle"
              onClick={this.handleDelete}
            />
          </Col>
        </Row>
        <Row>
          <p>{item.text}</p>
        </Row>
      </div>
    );
  }
}

export default FeedbackItem;
