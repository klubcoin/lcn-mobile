import React, { Component } from 'react';
import TrackingScrollView from '../TrackingScrollView';

export default class ScrollViewMore extends Component {
	render() {
		const { onScroll, children, customStyle } = this.props;
		return (
			<TrackingScrollView
				scrollEventThrottle={4}
				style={customStyle}
				onLayout={ev => {
					this.scrollViewHeight = ev.nativeEvent.layout.height;
					this.maxOffset = this.contentHeight - this.scrollViewHeight;
				}}
				onContentSizeChange={(contentWidth, contentHeight) => {
					this.contentHeightChanged = true;
					this.contentHeight = contentHeight;
					this.maxOffset = this.contentHeight - this.scrollViewHeight;
				}}
				onScroll={event => {
					this.yOffset = event.nativeEvent.contentOffset.y;
					this.maxOffset = this.contentHeight - this.scrollViewHeight;
					this.autoScroll = this.maxOffset - this.yOffset < 20;
					if (this.yOffset > this.contentHeight - this.scrollViewHeight - 40) {
						onScroll && onScroll();
					}
				}}
				onScrollEndDrag={event => {
					this.yOffset = event.nativeEvent.contentOffset.y;
				}}
			>
				{children}
			</TrackingScrollView>
		);
	}
}
