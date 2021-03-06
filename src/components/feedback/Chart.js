import React from 'react';
import { connect } from 'react-redux';
import * as d3 from 'd3';

const mapStateToProps = state => ({
  feedbackItems: state.feedback.list
});

class Chart extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      data: [],
      firstRender: true
    };
  }

  componentWillReceiveProps(nextProps) {
    let feedbackCopy = nextProps.feedbackItems.slice();
    let graphData = [];
    let countTypes = 0;
    feedbackCopy = feedbackCopy.reduce((acc, item) => {
      if (acc[item.options]) {
        acc[item.options] = acc[item.options] + 1;
      } else {
        acc[item.options] = 1;
      }
      return acc;
    }, {});
    for (var key in feedbackCopy) {
      countTypes += 1;
      const translate = {
        'Design critique': 'Design',
        'Bug report': 'Bug',
        'Code review': 'Code',
        'General feedback': 'General',
        'Other...': 'Other',
        'Feature suggestion': 'Feature'
      };
      const shortened = translate[key];
      graphData.push({ type: key, amount: feedbackCopy[key], shorterTitle: shortened });
    }
    this.setState({
      data: graphData
    }, () => {
      if (countTypes < 3) {
        this.props.changeGraphState();
      }
    });
  }

  componentDidUpdate() {
    if (this.state.firstRender) {
      const svg = d3.select(this.refs.anchor);
      const margin = {
        top: 20, right: 120, bottom: 30, left: 20
      };
      const width = this.props.width - margin.left - margin.right;
      const height = this.props.height - margin.top - margin.bottom;

      const x = d3.scaleBand().rangeRound([0, width]).padding(0.5);
      const y = d3.scaleLinear().rangeRound([height, 0]);
      const barPadding = 1;
      const colors = ['#0e1b30', '#11284f', '#203e72', '#1b4a9b', '#2055b2', '#1657c9'];

      const g = svg.append('g')
        .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');


      const { data } = this.state;
      x.domain(data.map(d => d.shorterTitle));
      y.domain([0, d3.max(data, d => d.amount)]);

      g.append('g')
        .attr('class', 'axis axis--x')
        .attr('transform', 'translate(0,' + height + ')')
        .call(d3.axisBottom(x));

      // uncomment this for y-axis
      // g.append('g')
      //   // .attr('class', 'axis axis--y')
      //   // .call(d3.axisLeft(y).ticks(3, ''))
      //   .append('text')
      //   .attr('transform', 'rotate(-90)')
      //   .attr('y', 26)
      //   .attr('dy', '0.71em')
      //   .attr('text-anchor', 'end')
      //   .text('Frequency');

      g.selectAll('.bar')
        .data(data)
        .enter()
        .append('rect')
        .attr('class', 'bar')
        .style('fill', (d, i) => {
          return colors[i];
        })
        .on('click', function(d) {
          this.props.clickGraph(d);
        }.bind(this))
        .attr('x', d => x(d.shorterTitle))
        .attr('y', height)
        .attr('width', x.bandwidth())
        .attr('height', 0)
        .transition()
        .duration(200)
        .delay(function (d, i) {
          return i * 100;
        })
        .attr('y', d => y(+d.amount))
        .attr('height', d => height - y(d.amount));

      // g.selectAll("text")
      //   .data(data)
      //   .enter()
      //   .append("text")
      //   .text(function(d) {
      //     for(var i = 0; i < data.length; i++){
      //       return d[i].amount;
      //     }
      //   })
      //   .attr("text-anchor", "middle")
      //   .attr("x", function(d, i) {
      //     return i * (width / data.length) + (width / data.length - barPadding) / 2;
      //   })
      //   .attr("y", function(d) {
      //     return height - (d * 4) + 14;
      //   })
      //   .attr("font-family", "sans-serif")
      //   .attr("font-size", "11px")
      //   .attr("fill", "red");

      g.selectAll("text.bar")
        .data(data)
        .enter().append("text")
        .attr("class", "bar")
        .attr("text-anchor", "middle")
        .attr("x", function(d) { return x(d.shorterTitle) + (x.bandwidth() / 2) })
        .attr("y", function(d) { return y(d.amount) - 10; })
        .attr('width', x.bandwidth())
        .text(function(d) { return d.amount; });


      this.setState({ firstRender: false });
    }
  }

  render() {
    const { data } = this.state;
    if (!data.length) {
      return null;
    }
    return <g ref="anchor" />;
  }
}

export default connect(mapStateToProps)(Chart);
