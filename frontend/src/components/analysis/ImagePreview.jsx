import "./ImagePreview.css";

function ImagePreview({ image }) {

    if (!image) {

        return null;

    }

    return (

        <div className="preview-card">

            <img
                src={URL.createObjectURL(image)}
                alt="Preview"
            />

        </div>

    );

}

export default ImagePreview;