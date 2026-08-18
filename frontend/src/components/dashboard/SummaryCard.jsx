import "./SummaryCard.css";

function SummaryCard({
    title,
    value,
    icon: Icon,
    color
}) {

    return (

        <div className={`summary-card ${color}`}>

            <div className="summary-left">

                <p>{title}</p>

                <h2>{value}</h2>

            </div>

            <div className="summary-right">

                <Icon />

            </div>

        </div>

    );

}

export default SummaryCard;