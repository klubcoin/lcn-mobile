import React from 'react';
import { shallow } from 'enzyme';
import configureMockStore from 'redux-mock-store';
import PurchaseSuccess from '.';

const mockStore = configureMockStore();

describe('PurchaseSuccess', () => {
	it('should render correctly', () => {
		const initialState = {
			infuraAvailability: {
				isBlocked: false
			}
		};
		const wrapper = shallow(<PurchaseSuccess navigation={{ getParam: () => false }} />, {
			context: { store: mockStore(initialState) }
		});
		expect(wrapper.dive()).toMatchSnapshot();
	});
});
