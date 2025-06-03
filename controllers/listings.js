const Listing = require("../models/listing");
const fetch = require('node-fetch');
// const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
// const mapToken = process.env.MAP_TOKEN;
// const geocodingClient = mbxGeocoding({accessToken : mapToken});

module.exports.index = async (req, res) => {
    const allListings = await Listing.find({});
    res.render("listings/index.ejs", {allListings});
};

module.exports.renderNewForm = (req, res) => {
    res.render("listings/new.ejs");
};

module.exports.showListing = async (req, res) => {
    let { id } = req.params;
    const listing = await Listing.findById(id).populate({path :"reviews", populate :{path: "author"}}).populate("owner");
    if (!listing ) {
        req.flash("error", "Listing you requested does not exist!");
        return res.redirect("/listings"); 
    }
    // console.log(listing);
    // console.log("Geometry on show page:", listing.geometry);
    res.render("listings/show.ejs", { listing });
};

module.exports.createListing = async (req, res, next) => {
    try {
        const location = req.body.listing.location; // Ensure the input key is correct
        const query = location; // Define query to be used in the fetch call
        
        const geoRes = await fetch(`https://api.maptiler.com/geocoding/${encodeURIComponent(query)}.json?key=${process.env.MAPTILER_KEY}`);
        const geoData = await geoRes.json();

        // Check if geoData has features before continuing
        if (!geoData.features || geoData.features.length === 0) {
            return res.redirect("/listings/new");
        }

        let url = req.file.path;
        let filename = req.file.filename;

        const newListing = new Listing(req.body.listing);
        newListing.owner = req.user._id;
        newListing.image = { url, filename };
        newListing.geometry = geoData.features[0].geometry;

        let savedListing = await newListing.save();
        console.log(savedListing);
        req.flash("success", "New Listing Created!");
        res.redirect("/listings");

    } catch (error) {
        console.error("Error fetching location data: ", error);
        res.redirect("/listings/new");
    }
};

module.exports.renderEditForm = async(req, res) => {
    let {id} = req.params;
    const listing = await Listing.findById(id);
    if (!listing) {
        req.flash("error", "Listing you requested does not exist!");
        return res.redirect("/listings"); 
    }

    let orignalImageUrl = listing.image.url;
    orignalImageUrl = orignalImageUrl.replace("/upload", "/upload/w_250");
    res.render("listings/edit.ejs", { listing , orignalImageUrl});
};

module.exports.updateListing = async (req, res) => {
    let { id } = req.params;
    let listing = await Listing.findByIdAndUpdate(id, {...req.body.listing});
    
    if(typeof req.file !=="undefined") {
        let url = req.file.path;
        let filename = req.file.filename;
        listing.image = { url,filename };
        await listing.save();
    }

    req.flash("success", "Listing Updated!")
    res.redirect(`/listings/${id}`);
};

module.exports.destroyListing = async (req, res) => {
    let { id } = req.params;
    let deletedListing  = await Listing.findByIdAndDelete(id);
    console.log(deletedListing);
    req.flash("success", "Listing Deleted!")
    res.redirect("/listings");
};