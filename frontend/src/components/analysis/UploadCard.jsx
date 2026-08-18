import { FaCloudUploadAlt, FaImage } from "react-icons/fa";
import "./UploadCard.css";

function UploadCard({
    selectedImage,
    onImageSelect,
    onAnalyze,
    loading
}) {

    const handleChange = (e) => {

        const file = e.target.files[0];

        if (file) {
            onImageSelect(file);
        }

    };

    return (

        <div className="upload-card">

            <FaCloudUploadAlt className="upload-icon"/>

            <h2>Drag & Drop Image</h2>

            <p>or click below to browse</p>

            <label className="upload-btn">

                <FaImage />

                Choose Image

                <input
                    type="file"
                    accept="image/*"
                    hidden
                    onChange={handleChange}
                />

            </label>

            {selectedImage && (

                <div className="selected-file">

                    {selectedImage.name}

                </div>

            )}

            <button

                className="analyze-main-btn"

                disabled={!selectedImage || loading}

                onClick={onAnalyze}

            >

                {loading ? "Analyzing..." : "Analyze Textile"}

            </button>

        </div>

    );

}

export default UploadCard;