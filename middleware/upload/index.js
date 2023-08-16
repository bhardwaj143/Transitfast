import multer from "multer";
const { diskStorage } = multer;

const multerFilter = (req, file, cb) => {
	console.log("getting inside multer",file);
	if (file.mimetype.startsWith("image")) {
		cb(null, true);
	}
	else if(file.mimetype.startsWith("video")){
		cb(null, true);
	} else {
		cb("Please upload only images.", false);
	}
};

const storage = diskStorage({
	destination: function (req, file, cb) {
		if(req.files?.profile_pic) cb(null, './uploads/profile_pic');
		else if (req.files?.vehicle_image) cb(null, './uploads/vehicle_image');
		else cb(null, './uploads/pictures');
	},
	filename: function (req, file, cb) {
		cb(null, Date.now() + '_' + file.originalname);
	}
})


const upload = multer({
	storage: storage,
	fileFilter: multerFilter
});

export default upload;
