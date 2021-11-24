import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { StyleSheet, View } from 'react-native';
import { strings } from '../../../../../locales/i18n';
import Summary from '../..//../Base/Summary';
import Text from '../../../Base/Text';
import DetailsModal from '../../../Base/DetailsModal';
import styles from './styles/index';
import store from "../store";

export default class MarketOrderSummary extends PureComponent {
	static propTypes = {
		amount: PropTypes.string,
		orderNumber: PropTypes.string,
		currency: PropTypes.string,
		products: PropTypes.array,
	};

	render = () => {
		const { orderNumber, currency, products, amount } = this.props;

		return (
			<DetailsModal>
				<DetailsModal.Body>
					<DetailsModal.SectionTitle style={styles.heading}>
						{strings('payQR.order_summary')}
					</DetailsModal.SectionTitle>
					<DetailsModal.Section >
						<Summary style={styles.section}>
							<Summary.Row>
								<Text big primary>
									{strings('payQR.order_number')}
								</Text>
								<Text small primary>
									{orderNumber}
								</Text>
							</Summary.Row>
							<View style={styles.productSection}>
								<Text big primary>
									{strings('market.products')}
								</Text>
								{
									products.map(e => {
										const { product, quantity } = e;
										const { title, price, currency, images } = product;
										currencyUnit = currency?.symbol || routes.mainNetWork.ticker;

										return (
											<View style={[styles.product, products.indexOf(e) == products.length - 1 && styles.lastItem]}>
												<View style={styles.productInfo}>
													<Text small>
														{title}
													</Text>

												</View>
												<View style={styles.quantityWrapper}>
													<Text small>x  <Text small>{quantity} </Text></Text>
													<Text small>
														{price} {currencyUnit}
													</Text>
												</View>
											</View>
										);
									})
								}
							</View>
							<Summary.Row>
								<Text big primary>
									{strings('transaction.amount')}
								</Text>
								<Text small primary bold>
									{amount} {currency}
								</Text>
							</Summary.Row>
						</Summary>
					</DetailsModal.Section>

					<DetailsModal.SectionTitle>
						{strings('payQR.billing_address')}
					</DetailsModal.SectionTitle>
					<DetailsModal.Section>
						<Summary style={styles.section}>
							{
								['name', 'phone', 'address']
									.map(k => {
										const info = store.shippingInfo[k];
										return (
											<Summary.Row>
												<View style={styles.addressTitle}>
													<Text small primary>
														{strings(`market.${k}`)}
													</Text>
												</View>
												<View style={styles.addressContent}>
													<Text small primary>
														{info}
													</Text>
												</View>

												
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
