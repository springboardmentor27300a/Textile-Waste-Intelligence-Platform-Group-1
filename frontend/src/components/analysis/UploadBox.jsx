import "./UploadBox.css";

function UploadBox({ onImageSelect }) {

    const handleChange = (e) => {

        const file = e.target.files[0];

        if (file) {

            onImageSelect(file);

        }

    };

    return (

        <div className="upload-box">

            <input

                type="file"

                accept="image/*"

                onChange={handleChange}

            />

        </div>

    );

}

export default UploadBox;