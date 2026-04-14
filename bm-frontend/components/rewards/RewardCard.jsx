export default function RewardCard({ reward, onRedeem }) {
    return (
      <div style={styles.card}>
        <img
          src={reward.image_url}
          alt={reward.name}
          style={styles.image}
        />
        <h3>{reward.name}</h3>
        <p>{reward.description}</p>
        <p><strong>Points Needed:</strong> {reward.points_needed}</p>
        <p><strong>Tier Required:</strong> {reward.tier_requirement}</p>
        <button onClick={() => onRedeem(reward.reward_id)} style={styles.button}>
          Redeem
        </button>
      </div>
    );
  }
  
  const styles = {
    card: {
      border: "1px solid #ddd",
      borderRadius: "12px",
      padding: "16px",
      width: "240px",
      boxShadow: "0 2px 6px rgba(0,0,0,0.08)",
      backgroundColor: "white",
    },
    image: {
      width: "100%",
      height: "160px",
      objectFit: "cover",
      borderRadius: "8px",
      marginBottom: "12px",
    },
    button: {
      marginTop: "12px",
      padding: "10px 14px",
      backgroundColor: "#2563eb",
      color: "white",
      border: "none",
      borderRadius: "8px",
      cursor: "pointer",
    },
  };