import React from 'react';
import { shallow } from 'enzyme';
import configureMockStore from 'redux-mock-store';
import ChatMessage from './';

const mockStore = configureMockStore();

describe('ChatMessage', () => {
	it('should render correctly', () => {
		const initialState = {
			infuraAvailability: {
				isBlocked: false
			}
		};
		const wrapper = shallow(<ChatMessage navigation={{ getParam: () => false }} />, {
			context: { store: mockStore(initialState) }
		});
		expect(wrapper.dive()).toMatchSnapshot();
	});
});
