import React from 'react';
import { shallow } from 'enzyme';
import configureMockStore from 'redux-mock-store';
import ChatList from './';

const mockStore = configureMockStore();

describe('ChatList', () => {
	it('should render correctly', () => {
		const initialState = {
			infuraAvailability: {
				isBlocked: false
			}
		};
		const wrapper = shallow(<ChatList navigation={{ getParam: () => false }} />, {
			context: { store: mockStore(initialState) }
		});
		expect(wrapper.dive()).toMatchSnapshot();
	});
});
