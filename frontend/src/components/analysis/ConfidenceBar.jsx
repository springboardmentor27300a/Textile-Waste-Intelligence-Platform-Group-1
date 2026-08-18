import "./ConfidenceBar.css";

function ConfidenceBar({ confidence }) {

    const percentage = Math.round(confidence * 100);

    return (

        <>

            <div className="confidence-text">

                Confidence

                <span>{percentage}%</span>

            </div>

            <div className="confidence-bar">

                <div

                    className="confidence-fill"

                    style={{

                        width:`${percentage}%`

                    }}

                />

            </div>

        </>

    );

}

export default ConfidenceBar;