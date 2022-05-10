import React from 'react';
import { shallow } from 'enzyme';
import configureMockStore from 'redux-mock-store';
import NewChat from './';

const mockStore = configureMockStore();

describe('NewChat', () => {
	it('should render correctly', () => {
		const initialState = {
			infuraAvailability: {
				isBlocked: false
			}
		};
		const wrapper = shallow(<NewChat navigation={{ getParam: () => false }} />, {
			context: { store: mockStore(initialState) }
		});
		expect(wrapper.dive()).toMatchSnapshot();
	});
});
