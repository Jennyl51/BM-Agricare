import { View, Text, StyleSheet, TextInput, ScrollView } from 'react-native';

export default function ConsultationRequests() {
    return (
        <ScrollView style={styles.container}>
            <Text style={styles.title}>Consultation Requests</Text>
            <TextInput style={styles.searchBar} placeholder="Search" />
            <View style={styles.filterRow}>
                <View style={styles.regionButton}>
                    <Text>Region ▼</Text>
                </View>
                <Text style={styles.filterText}>Filter ≡</Text>
            </View>
            <View style={styles.card}>
                <View style={styles.cardPhoto} />
                <View style={styles.cardInfo}>
                    <View style={styles.statusBadge}>
                        <Text style={styles.statusText}>Completed</Text>
                    </View>
                    <Text style={styles.cardTitle}>Request Title</Text>
                    <Text style={styles.cardDetail}>Date Requested</Text>
                    <Text style={styles.cardDetail}>Retailer Name</Text>
                </View>
            </View>
            <View style={styles.card}>
                <View style={styles.cardPhoto} />
                <View style={styles.cardInfo}>
                    <View style={[styles.statusBadge, { backgroundColor: 'white', borderWidth: 1, borderColor: '#68BC45' }]}>
                        <Text style={[styles.statusText, { color: '#68BC45' }]}>In Progress</Text>
                    </View>
                    <Text style={styles.cardTitle}>Request Title</Text>
                    <Text style={styles.cardDetail}>Date Requested</Text>
                    <Text style={styles.cardDetail}>Retailer Name</Text>
                </View>
            </View>

            <View style={styles.card}>
                <View style={styles.cardPhoto} />
                <View style={styles.cardInfo}>
                    <View style={[styles.statusBadge, { backgroundColor: 'white', borderWidth: 1, borderColor: '#68BC45' }]}>
                        <Text style={[styles.statusText, { color: '#68BC45' }]}>Pending</Text>
                    </View>
                    <Text style={styles.cardTitle}>Request Title</Text>
                    <Text style={styles.cardDetail}>Date Requested</Text>
                    <Text style={styles.cardDetail}>Retailer Name</Text>
                </View>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 24,
        backgroundColor: '#ffffff',
    },
    title: {
        fontSize: 24,
        fontWeight: '700',
        textAlign: 'center',
        color: '#002F71',
    },
    searchBar: {
        borderWidth: 1,
        borderColor: '#fff',
        borderRadius: 15,
        padding: 10,
        marginBottom: 10,
    },
    filterRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    regionButton: {
        borderWidth: 1,
        borderColor: '#68BC45',
        borderRadius: 15,
        padding: 8,
        paddingHorizontal: 12,
    },
    filterText: {
        color: '#002F71',
        fontWeight: '600',
    },
    card: {
        flexDirection: 'row',
        gap: 12,
        marginBottom: 16,
    },
    cardPhoto: {
        width: 80,
        height: 80,
        backgroundColor: '#ccc',
        borderRadius: 8,
    },
    cardInfo: {
        flex: 1,
    },
    statusBadge: {
        backgroundColor: '#68BC45',
        borderRadius: 15,
        paddingHorizontal: 10,
        paddingVertical: 4,
        alignSelf: 'flex-start',
        marginBottom: 4,
    },
    statusText: {
        color: 'white',
        fontWeight: '600',
        fontSize: 12,
    },
    cardTitle: {
        fontWeight: '600',
        color: '#002F71',
    },
    cardDetail: {
        color: '#7F7F7F',
        fontSize: 12,
    },
});