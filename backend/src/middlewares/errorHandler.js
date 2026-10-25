const notFound = (req, res)=> {
    const resData = {
        success: false,
        message: "Salomat !?"
    }

    req.json(resData)
}

const errorHandler = (err, req, res, next) =>{
    if (res.headersSent) return next(err);

    if(err.name = 'ZodError')
        return res.status(400).json({success: false, error: issues});

    if(err.code = 'P2025')
        return res.status(404).json({success: false, error: 'Topilmadi'});

    if(err.code = 'P2002')
        return res.status(409).json({success: false, error: 'Bunday ma\'lumot allaqachon mavjud'});
    

    const status = err.status || 500;

    if(status >= 500){
        console.error(err);
        return res.status(status).json({success: false, error:'Server xatoligi'});
    }

    res.status(status).json({ success: false, error: err.message });

}

module.exports = { notFound, errorHandler}