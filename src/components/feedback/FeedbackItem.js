import React from 'react';
import { Link } from 'react-router-dom';
import { connect } from 'react-redux';
import axios from 'axios';
import { Row, Col, Icon, Tooltip, message } from 'antd';
import VerificationModal from '../shared/VerificationModal';
import { populateFeedback } from '../../actions/index';
import EditModal from '../shared/EditModal';

const mapStateToProps = (state) => {
  return {
    auth: state.auth,
    project: state.feedback.project
  };
};

class FeedbackItem extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      component: 'feedback',
    };

    this.upvote = this.upvote.bind(this);
    this.downvote = this.downvote.bind(this);
    this.vote = this.vote.bind(this);
    this.mark = this.mark.bind(this);
    this.check = this.check.bind(this);
    this.close = this.close.bind(this);
  }

  /* ***************** VOTING ***************** */
  vote(difference, vote) {
    this.props.voteHandler();
    axios.post('/api/votes',
      {
        votes_id: this.props.item.votes_id,
        feedback_id: this.props.item.id,
        vote,
        project_id: this.props.item.project_id,
        difference
      }
    )
      .then(() => {
        populateFeedback(this.props.item.project_id);
      });
  }

  mark(marked) {
    this.props.voteHandler();
    axios.post('/api/issues', {
      feedback_id: this.props.item.id,
      marked
    })
      .then(() => {
        populateFeedback(this.props.item.project_id);
      });
  }

  upvote() {
    if (this.props.auth) {
      if (this.props.item.vote) {
        this.vote(-1, null);
      } else if (this.props.item.vote === false) {
        this.vote(2, true);
      } else if (this.props.item.vote === null) {
        this.vote(1, true);
      }
    } else {
      message.warning('Please log in to vote!');
    }
  }

  downvote() {
    if (this.props.auth) {
      if (this.props.item.vote) {
        this.vote(-2, false);
      } else if (this.props.item.vote === false) {
        this.vote(1, null);
      } else if (this.props.item.vote === null) {
        this.vote(-1, false);
      }
    } else {
      message.warning('Please log in to vote!');
    }
  }

  /* ***************** RESOLVING ISSUES ***************** */
  check() {
    if (this.props.auth) {
      if (this.props.item.marked) {
        this.mark(null);
      } else if (this.props.item.marked === false) {
        this.mark(true);
      } else if (this.props.item.marked === null) {
        this.mark(true);
      }
    }
  }

  close() {
    if (this.props.auth) {
      if (this.props.item.marked) {
        this.mark(false);
      } else if (this.props.item.marked === false) {
        this.mark(null);
      } else if (this.props.item.marked === null) {
        this.mark(false);
      }
    }
  }

  render() {
    const { item } = this.props;
    let { images } = this.props;
    images = images ? this.props.images.map(file => ({
      thumbnail: `/images/feedback/thumbnails/${file}`,
      fullsize: `/images/feedback/processed/${file}`,
    })) : images;
    return (
      <div className={"feedback-item " + (item.marked !== null ? 'fade' : 'feedback-item')}>  
        <Row>
          <Col span={2}>
            <Row>
              { ((item.vote) === false) || ((item.vote) === null) ?
                <Icon
                  type="up"
                  value={1}
                  onClick={this.upvote}
                /> :
                <Icon
                  type="up-circle"
                  onClick={this.upvote}
                />
              }
            </Row>
            <Row>
              <h4>&nbsp;{item.up - item.down}</h4>
            </Row>
            <Row>
              { ((item.vote) === null) || ((item.vote) === true) ?
                <Icon
                  type="down"
                  value={-1}
                  onClick={this.downvote}
                /> :
                <Icon
                  type="down-circle"
                  onClick={this.downvote}
                />
              }
            </Row>
          </Col>
          <Col span={18}>
            <Row>
              <Link to={`/user/${item.name}`}>
                <img
                  className="feedback-icon"
                  alt="profile-pic"
                  src={item.avatar}
                />
              </Link>
              <h2>
                &nbsp;&nbsp;{item.options} by
                <Link to={`/user/${item.name}`}>
                  &nbsp;{item.display_name}
                </Link>
              </h2>
            </Row>
            <Row>
              <p>{item.text}</p>

              { item.created_at !== item.updated_at ?
                <h6>This user has edited their feedback.</h6> : null
              }
              { item.marked ?
                <h6>The developer has marked this issue as resolved.</h6> : null
              }
              { item.marked === false ?
                <h6>The developer has marked this issue as unresolvable.</h6> : null
              }
            </Row>
            <Row className="feedback-images">
              {images ? images.map(image => (
                <a href={image.fullsize} key={image.thumbnail} target="_blank" >
                  <div key={image.thumbnail} >
                    <img src={image.thumbnail} key={image.thumbnail} alt="feedback" />
                  </div>
                </a>)) : null}
            </Row>
          </Col>
          { (this.props.auth && this.props.auth.username === this.props.project.name) ?
            <Col>
              <Col span={1}>
                <Tooltip title="Mark as completed">
                  { (item.marked === false) || (item.marked === null) ?
                    <Icon
                      className="icon"
                      type="check-circle-o"
                      onClick={this.check}
                    /> :
                    <Icon
                      className="icon"
                      type="check-circle"
                      onClick={this.check}
                      style={{ color: '#00d01f' }}
                    />
                }
                </Tooltip>
              </Col>
              <Col span={1}>
                <Tooltip title="Mark as unresolvable">
                  { (item.marked === null) || (item.marked === true) ?
                    <Icon
                      className="icon"
                      type="close-circle-o"
                      onClick={this.close}
                    /> :
                    <Icon
                      className="icon"
                      type="close-circle"
                      onClick={this.close}
                      style={{ color: '#ff0000' }}
                    />
                }
                </Tooltip>
              </Col>
            </Col> : null
          }
          { (this.props.auth && this.props.auth.username === item.name) ?
            <Col>
              <Col span={1} className="icon">
                <EditModal
                  name={item.name}
                  text={item.text}
                  id={item.id}
                  project_id={item.project_id}
                  component="feedback"
                />
              </Col>
              <Col span={1} className="icon">
                <VerificationModal
                  item={item}
                  component={this.state.component}
                />
              </Col>
            </Col>
          : null
        }
        </Row>
      </div>
    );
  }
}

export default connect(mapStateToProps)(FeedbackItem);
