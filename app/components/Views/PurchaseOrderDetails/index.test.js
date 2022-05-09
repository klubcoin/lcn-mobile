import React from 'react';
import { shallow } from 'enzyme';
import configureMockStore from 'redux-mock-store';
import PurchaseOrderDetails from './';

const mockStore = configureMockStore();

describe('PurchaseOrderDetails', () => {
	it('should render correctly', () => {
		const initialState = {
			infuraAvailability: {
				isBlocked: false
			}
		};
		const wrapper = shallow(<PurchaseOrderDetails navigation={{ getParam: () => false }} />, {
			context: { store: mockStore(initialState) }
		});
		expect(wrapper.dive()).toMatchSnapshot();
	});
});
