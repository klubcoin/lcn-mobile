import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { StyleSheet } from 'react-native';
import { strings } from '../../../../locales/i18n';
import Summary from '../../Base/Summary';
import Text from '../../Base/Text';
import DetailsModal from '../../Base/DetailsModal';

const styles = StyleSheet.create({
	section: {
		flex: 1,
	},
	heading: {
		marginTop: 20
	}
});

export default class OrderSummary extends PureComponent {
	static propTypes = {
		amount: PropTypes.string,
		orderNumber: PropTypes.string,
		currency: PropTypes.string,
		billingAddress: PropTypes.object,
	};

	render = () => {
		const { orderNumber, amount, currency, billingAddress } = this.props;

		return (
			<DetailsModal>
				<DetailsModal.Body>
					<DetailsModal.SectionTitle style={styles.heading}>
						{strings('order_summary.order_summary')}
					</DetailsModal.SectionTitle>
					<DetailsModal.Section >
						<Summary style={styles.section}>
							<Summary.Row>
								<Text small primary>
									{strings('order_summary.order_number')}
								</Text>
								<Text small primary>
									{orderNumber}
								</Text>
							</Summary.Row>
							<Summary.Row>
								<Text small primary>
									{strings('transaction.amount')}
								</Text>
								<Text small primary bold big>
									{amount} {currency}
								</Text>
							</Summary.Row>
						</Summary>
					</DetailsModal.Section>

					<DetailsModal.SectionTitle>
						{strings('order_summary.billing_address')}
					</DetailsModal.SectionTitle>
					<DetailsModal.Section>
						<Summary style={styles.section}>
							{
								['streetAndNumber', 'city', 'postalCode', 'country']
									.map(k => {
										const info = billingAddress[k];
										return (
											<Summary.Row>
												<Text small primary>
													{strings(`order_summary.${k}`)}
												</Text>
												<Text small primary>
													{info}
												</Text>
											</Summary.Row>
										)
									})
							}
						</Summary>
					</DetailsModal.Section>
				</DetailsModal.Body>
			</DetailsModal>
		);
	};
}
