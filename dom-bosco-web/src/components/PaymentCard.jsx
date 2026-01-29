import { useState, useEffect } from "react";
import { useTheme } from "../contexts/ThemeContext";

function PaymentCard({ onPaymentDataChange }) {
  const { isDark } = useTheme();
  const [savedCards, setSavedCards] = useState([]);
  const [selectedCard, setSelectedCard] = useState(null);
  const [showNewCardForm, setShowNewCardForm] = useState(false);
  
  const [cardData, setCardData] = useState({
    number: "",
    expiry: "",
    cvv: "",
    saveCard: false
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    const mockSavedCards = [
      { id: 1, lastDigits: "4532", brand: "Visa", expiryMonth: "12", expiryYear: "2025" },
      { id: 2, lastDigits: "5421", brand: "Mastercard", expiryMonth: "08", expiryYear: "2026" }
    ];
  }, []);

  const formatCardNumber = (value) => {
    const cleaned = value.replace(/\s/g, "");
    const chunks = cleaned.match(/.{1,4}/g);
    return chunks ? chunks.join(" ") : cleaned;
  };

  const formatExpiry = (value) => {
    const cleaned = value.replace(/\D/g, "");
    if (cleaned.length >= 2) {
      return cleaned.slice(0, 2) + "/" + cleaned.slice(2, 4);
    }
    return cleaned;
  };

  const detectCardBrand = (number) => {
    const cleaned = number.replace(/\s/g, "");
    if (/^4/.test(cleaned)) return "Visa";
    if (/^5[1-5]/.test(cleaned)) return "Mastercard";
    if (/^3[47]/.test(cleaned)) return "Amex";
    if (/^6(?:011|5)/.test(cleaned)) return "Discover";
    if (/^3(?:0[0-5]|[68])/.test(cleaned)) return "Diners";
    if (/^35/.test(cleaned)) return "JCB";
    if (/^(636368|438935|504175|451416|636297)/.test(cleaned)) return "Elo";
    return "Unknown";
  };

  const validateCard = () => {
    const newErrors = {};
    const cleaned = cardData.number.replace(/\s/g, "");

    if (!cleaned || cleaned.length < 13 || cleaned.length > 19) {
      newErrors.number = "Número do cartão inválido";
    }

    const expiryParts = cardData.expiry.split("/");
    if (expiryParts.length !== 2 || expiryParts[0].length !== 2 || expiryParts[1].length !== 2) {
      newErrors.expiry = "Validade inválida (MM/AA)";
    } else {
      const month = parseInt(expiryParts[0]);
      const year = parseInt("20" + expiryParts[1]);
      const now = new Date();
      const currentYear = now.getFullYear();
      const currentMonth = now.getMonth() + 1;

      if (month < 1 || month > 12) {
        newErrors.expiry = "Mês inválido";
      } else if (year < currentYear || (year === currentYear && month < currentMonth)) {
        newErrors.expiry = "Cartão vencido";
      }
    }

    if (!cardData.cvv || cardData.cvv.length < 3 || cardData.cvv.length > 4) {
      newErrors.cvv = "CVV inválido";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    let formattedValue = value;
    
    if (name === "number") {
      formattedValue = formatCardNumber(value.replace(/\D/g, "").slice(0, 19));
    } else if (name === "expiry") {
      formattedValue = formatExpiry(value);
    } else if (name === "cvv") {
      formattedValue = value.replace(/\D/g, "").slice(0, 4);
    }

    setCardData(prev => ({
      ...prev,
      [name]: type === "checkbox" ? checked : formattedValue
    }));

    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: "" }));
    }
  };

  const handleCardSelection = (card) => {
    setSelectedCard(card);
    setShowNewCardForm(false);
    onPaymentDataChange({
      method: "credit_card",
      cardId: card.id,
      lastDigits: card.lastDigits,
      brand: card.brand
    });
  };

  const handleNewCardSubmit = () => {
    if (validateCard()) {
      const brand = detectCardBrand(cardData.number);
      const lastDigits = cardData.number.replace(/\s/g, "").slice(-4);
      
      onPaymentDataChange({
        method: "credit_card",
        cardNumber: cardData.number.replace(/\s/g, ""),
        cardExpiry: cardData.expiry,
        cardCvv: cardData.cvv,
        saveCard: cardData.saveCard,
        brand: brand,
        lastDigits: lastDigits
      });
      
      return true;
    }
    return false;
  };

  useEffect(() => {
    if (showNewCardForm || selectedCard === null) {
      onPaymentDataChange({ validateFn: handleNewCardSubmit });
    }
  }, [cardData, showNewCardForm, selectedCard]);

  const cardBrand = detectCardBrand(cardData.number);

  const getCardIcon = (brand) => {
    const icons = {
      Visa: "💳",
      Mastercard: "💳",
      Amex: "💳",
      Elo: "💳",
      Unknown: "💳"
    };
    return icons[brand] || "💳";
  };

  return (
    <div style={{ padding: "24px" }}>
      <div style={{ marginBottom: "24px" }}>
        <h3 style={{ 
          fontSize: "18px", 
          fontWeight: "600", 
          marginBottom: "12px",
          color: "var(--text-primary)"
        }}>
          Pagamento com Cartão de Crédito
        </h3>
        <p style={{ 
          fontSize: "14px", 
          color: "var(--text-secondary)",
          lineHeight: "1.6"
        }}>
          Pague com segurança usando seu cartão de crédito.
        </p>
      </div>

      {savedCards.length > 0 && !showNewCardForm && (
        <div style={{ marginBottom: "24px" }}>
          <h4 style={{ 
            fontSize: "14px", 
            fontWeight: "600", 
            marginBottom: "12px",
            color: "var(--text-secondary)"
          }}>
            Cartões Salvos
          </h4>
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {savedCards.map((card) => (
              <div
                key={card.id}
                onClick={() => handleCardSelection(card)}
                style={{
                  padding: "16px",
                  border: `2px solid ${selectedCard?.id === card.id 
                    ? (isDark ? "#a78bfa" : "#8b5cf6")
                    : "var(--border-color)"}`,
                  borderRadius: "12px",
                  cursor: "pointer",
                  background: selectedCard?.id === card.id
                    ? (isDark ? "rgba(167, 139, 250, 0.1)" : "rgba(139, 92, 246, 0.05)")
                    : (isDark ? "#1a1a1a" : "#fff"),
                  transition: "all 0.2s ease",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between"
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  <div style={{ fontSize: "24px" }}>
                    {getCardIcon(card.brand)}
                  </div>
                  <div>
                    <div style={{ 
                      fontWeight: "600", 
                      fontSize: "14px",
                      color: "var(--text-primary)",
                      marginBottom: "4px"
                    }}>
                      {card.brand} •••• {card.lastDigits}
                    </div>
                    <div style={{ fontSize: "12px", color: "var(--text-secondary)" }}>
                      Válido até {card.expiryMonth}/{card.expiryYear}
                    </div>
                  </div>
                </div>
                {selectedCard?.id === card.id && (
                  <div style={{ color: isDark ? "#a78bfa" : "#8b5cf6", fontSize: "20px" }}>
                    ✓
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {savedCards.length > 0 && !showNewCardForm && (
        <button
          onClick={() => setShowNewCardForm(true)}
          style={{
            width: "100%",
            padding: "14px",
            background: "transparent",
            border: `2px dashed var(--border-color)`,
            borderRadius: "12px",
            cursor: "pointer",
            fontSize: "14px",
            fontWeight: "600",
            color: "var(--text-secondary)",
            marginBottom: "20px",
            transition: "all 0.2s ease"
          }}
        >
          + Adicionar novo cartão
        </button>
      )}

      {(showNewCardForm || savedCards.length === 0) && (
        <div>
          {savedCards.length > 0 && (
            <button
              onClick={() => {
                setShowNewCardForm(false);
                setCardData({ number: "", expiry: "", cvv: "", saveCard: false });
                setErrors({});
              }}
              style={{
                marginBottom: "16px",
                padding: "8px",
                background: "transparent",
                border: "none",
                color: "var(--text-secondary)",
                cursor: "pointer",
                fontSize: "14px",
                display: "flex",
                alignItems: "center",
                gap: "4px"
              }}
            >
              ← Voltar para cartões salvos
            </button>
          )}

          <div 
            style={{
              padding: "24px",
              background: isDark 
                ? "linear-gradient(135deg, #4c1d95 0%, #5b21b6 100%)"
                : "linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)",
              borderRadius: "16px",
              marginBottom: "24px",
              minHeight: "180px",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              color: "#fff",
              boxShadow: "0 8px 24px rgba(139, 92, 246, 0.3)",
              position: "relative",
              overflow: "hidden"
            }}
          >
            <div style={{
              position: "absolute",
              top: "-50px",
              right: "-50px",
              width: "150px",
              height: "150px",
              background: "rgba(255, 255, 255, 0.1)",
              borderRadius: "50%"
            }} />
            
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div style={{ fontSize: "32px" }}>💳</div>
              <div style={{ fontSize: "20px", fontWeight: "700" }}>
                {cardBrand !== "Unknown" ? cardBrand : ""}
              </div>
            </div>

            <div>
              <div style={{ 
                fontSize: "20px", 
                fontFamily: "monospace", 
                letterSpacing: "2px",
                marginBottom: "16px",
                fontWeight: "500"
              }}>
                {cardData.number || "•••• •••• •••• ••••"}
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", alignItems: "flex-end" }}>
                <div>
                  <div style={{ fontSize: "10px", opacity: 0.7, marginBottom: "4px" }}>
                    VALIDADE
                  </div>
                  <div style={{ fontSize: "14px", fontWeight: "600" }}>
                    {cardData.expiry || "MM/AA"}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <div>
              <label style={{
                display: "block",
                fontSize: "13px",
                fontWeight: "600",
                marginBottom: "8px",
                color: "var(--text-secondary)"
              }}>
                Número do Cartão
              </label>
              <input
                type="text"
                name="number"
                placeholder="0000 0000 0000 0000"
                value={cardData.number}
                onChange={handleInputChange}
                maxLength="19"
                style={{
                  width: "100%",
                  padding: "12px",
                  fontSize: "16px",
                  fontFamily: "monospace",
                  border: errors.number ? "2px solid #ef4444" : "1px solid var(--border-color)",
                  borderRadius: "8px",
                  background: isDark ? "#1a1a1a" : "#fff",
                  color: "var(--text-primary)"
                }}
              />
              {errors.number && (
                <span style={{ fontSize: "12px", color: "#ef4444", marginTop: "4px", display: "block" }}>
                  {errors.number}
                </span>
              )}
            </div>


            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
              <div>
                <label style={{
                  display: "block",
                  fontSize: "13px",
                  fontWeight: "600",
                  marginBottom: "8px",
                  color: "var(--text-secondary)"
                }}>
                  Validade
                </label>
                <input
                  type="text"
                  name="expiry"
                  placeholder="MM/AA"
                  value={cardData.expiry}
                  onChange={handleInputChange}
                  maxLength="5"
                  style={{
                    width: "100%",
                    padding: "12px",
                    fontSize: "16px",
                    fontFamily: "monospace",
                    border: errors.expiry ? "2px solid #ef4444" : "1px solid var(--border-color)",
                    borderRadius: "8px",
                    background: isDark ? "#1a1a1a" : "#fff",
                    color: "var(--text-primary)"
                  }}
                />
                {errors.expiry && (
                  <span style={{ fontSize: "12px", color: "#ef4444", marginTop: "4px", display: "block" }}>
                    {errors.expiry}
                  </span>
                )}
              </div>

              <div>
                <label style={{
                  display: "block",
                  fontSize: "13px",
                  fontWeight: "600",
                  marginBottom: "8px",
                  color: "var(--text-secondary)"
                }}>
                  CVV
                </label>
                <input
                  type="text"
                  name="cvv"
                  placeholder="123"
                  value={cardData.cvv}
                  onChange={handleInputChange}
                  maxLength="4"
                  style={{
                    width: "100%",
                    padding: "12px",
                    fontSize: "16px",
                    fontFamily: "monospace",
                    border: errors.cvv ? "2px solid #ef4444" : "1px solid var(--border-color)",
                    borderRadius: "8px",
                    background: isDark ? "#1a1a1a" : "#fff",
                    color: "var(--text-primary)"
                  }}
                />
                {errors.cvv && (
                  <span style={{ fontSize: "12px", color: "#ef4444", marginTop: "4px", display: "block" }}>
                    {errors.cvv}
                  </span>
                )}
              </div>
            </div>

            <div 
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                padding: "12px",
                background: isDark ? "rgba(139, 92, 246, 0.1)" : "rgba(139, 92, 246, 0.05)",
                borderRadius: "8px"
              }}
            >
              <input
                type="checkbox"
                id="saveCard"
                name="saveCard"
                checked={cardData.saveCard}
                onChange={handleInputChange}
                style={{ cursor: "pointer" }}
              />
              <label 
                htmlFor="saveCard" 
                style={{ 
                  fontSize: "13px", 
                  color: "var(--text-secondary)",
                  cursor: "pointer",
                  userSelect: "none"
                }}
              >
                💾 Salvar este cartão para próximas compras
              </label>
            </div>
          </div>
        </div>
      )}

      <div 
        style={{
          marginTop: "24px",
          padding: "16px",
          background: isDark ? "rgba(16, 185, 129, 0.1)" : "rgba(16, 185, 129, 0.1)",
          borderRadius: "8px",
          fontSize: "13px",
          color: isDark ? "#6ee7b7" : "#059669",
          lineHeight: "1.6"
        }}
      >
        <strong>🔒 Pagamento 100% Seguro</strong>
        <p style={{ margin: "8px 0 0 0" }}>
          Seus dados são criptografados e protegidos. Utilizamos o Mercado Pago para processar pagamentos com segurança.
        </p>
      </div>
    </div>
  );
}

export default PaymentCard;
