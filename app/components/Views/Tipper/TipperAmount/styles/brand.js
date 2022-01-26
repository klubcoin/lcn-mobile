import { StyleSheet } from "react-native";
import { colors } from "../../../../../styles/common";

const styles = StyleSheet.create({
    wrapper: {
        backgroundColor: colors.primaryFox,
        flex: 1
    },
    title: {
        color: colors.white
    },
    currencySymbol: {
        color: colors.white,
    },
    currencySymbolSmall: {
        color: colors.white
    },
    assetsTitle: {
        color: colors.white
    }
});

export default styles;