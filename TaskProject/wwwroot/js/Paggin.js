//function Pagination(totalrecord, currentindex, pagesize, div, Type, divInfoId, divPagesId) {
//    let pageName = '';
//    if (divPagesId != '')
//        pageName = '_' + divPagesId;

//    if (divInfoId == '')
//        divInfoId = 'div-pageinfo';
//    else
//        divInfoId = 'div-pageinfo_' + divInfoId;

//    if (divPagesId == '')
//        divPagesId = 'div-pages';
//    else {
//        divPagesId = 'div-pages_' + divPagesId;
//    }
//    $("#" + divInfoId).html('');
//    currentindex = parseInt(currentindex);
//    totalrecord = parseInt(totalrecord);
//    pagesize = parseInt(pagesize);
//    var pagestring = '';

//    $(div).html("");


//    var pagerlink = Math.ceil(totalrecord / pagesize);
//    var lastindex = pagerlink - 1;
//    if (totalrecord === 0) {
//        $("#" + divInfoId).append('<p>Displaying 0 out of 0 items </p>');
//    }
//    else if (totalrecord > 0) {
//        if (currentindex === lastindex) {
//            if (currentindex === 0) {
//                $("#" + divInfoId).append('<p>Displaying ' + 1 + ' to ' + totalrecord + ' out of ' + totalrecord + ' items </p>');
//            }
//            else {
//                $("#" + divInfoId).append('<p>Displaying ' + parseInt(1 + (pagesize * (currentindex - 1) + parseInt(pagesize))) + ' to ' + totalrecord + ' out of ' + totalrecord + ' items </p>')
//            }
//        }
//        else {
//            $("#" + divInfoId).append('<p>Displaying ' + parseInt(pagesize * currentindex + 1) + ' to ' + parseInt(pagesize * currentindex + parseInt(pagesize)) + ' out of ' + totalrecord + ' items </p>')
//        }
//        $("#" + divInfoId).append('');
//        if (totalrecord === 0) {
//            pagestring = pagestring + '<a class="paginate_button previous disabled" aria-controls="basic-1" data-dt-idx="0" tabindex="0" id="basic-1_previous">Previous</a>' +
//                '<a class="paginate_button previous disabled">Next</a>' +
//                '<a class="paginate_button disabled">Last</a>';
//        }
//        else {
//            if (currentindex === 0) {
//                pagestring = pagestring +
//                    '<a class="paginate_button previous disabled">First</a>' +
//                    '<a class="paginate_button previous disabled">Previous</a>';
//            }
//            else {
//                pagestring = pagestring + '<a class="paginate_button" onclick="Search' + pageName + '(0);">First</a>' +
//                    '<a class="paginate_button previous" onclick="Search' + pageName + '(' + parseInt(currentindex - 1) + ');">Previous</a>';
//            }
//            var counter = 0;
//            var intial = 0;
//            if (parseInt(currentindex) < 5) {
//                intial = 0;
//            }
//            else {
//                intial = parseInt(currentindex) - 3;
//            }
//            pagestring += '<span>';

//            for (var i = intial; i < pagerlink; i++) {
//                var j = i + 1;
//                if (i === currentindex) {
//                    pagestring = pagestring + '<a class="paginate_button activebutton hclass" value="' + j + '">' + j + '</a>';
//                }
//                else {
//                    pagestring = pagestring + '<a class="paginate_button hclass" onclick="Search' + pageName + '(' + i + ');" value="' + j + '">' + j + '</a>';
//                }
//                if (counter === 5)
//                    break;
//                counter++;
//            }

//            if (currentindex === lastindex) {
//                pagestring = pagestring + '<a class="paginate_button disabled">Next</a>' +
//                    '<a class="paginate_button disabled">Last</a>';
//            }
//            else {
//                var nextindex = (parseInt(currentindex) + 1);
//                pagestring = pagestring + '<a class="paginate_button hclass" onclick="Search' + pageName + '(' + nextindex + ');">Next</a>' +
//                    '<a class="paginate_button" onclick="Search' + pageName + '(' + lastindex + ');">Last</a>';
//            }
//        }
//        pagestring += '</span>';
//        $("#" + divPagesId).html('');
//        $("#" + divPagesId).append(pagestring);
//    }
//}


function Pagination(totalrecord, currentindex, pagesize, div, Type, divInfoId, divPagesId) {
    let pageName = '';
    if (divPagesId != '')
        pageName = '_' + divPagesId;

    if (divInfoId == '')
        divInfoId = 'div-pageinfo';
    else
        divInfoId = 'div-pageinfo_' + divInfoId;

    if (divPagesId == '')
        divPagesId = 'div-pages';
    else {
        divPagesId = 'div-pages_' + divPagesId;
    }
    $("#" + divInfoId).html('');
    currentindex = parseInt(currentindex);
    totalrecord = parseInt(totalrecord);
    pagesize = parseInt(pagesize);
    var pagestring = '';

    $(div).html("");

    var pagerlink = Math.ceil(totalrecord / pagesize);
    var lastindex = pagerlink - 1;

    // Page info
    if (totalrecord === 0) {
        $("#" + divInfoId).append('<p>Displaying 0 out of 0 items </p>');
    }
    else if (totalrecord > 0) {
        if (currentindex === lastindex) {
            if (currentindex === 0) {
                $("#" + divInfoId).append('<p>Displaying ' + 1 + ' to ' + totalrecord + ' out of ' + totalrecord + ' items </p>');
            }
            else {
                $("#" + divInfoId).append('<p>Displaying ' + parseInt(1 + (pagesize * (currentindex - 1) + parseInt(pagesize))) + ' to ' + totalrecord + ' out of ' + totalrecord + ' items </p>')
            }
        }
        else {
            $("#" + divInfoId).append('<p>Displaying ' + parseInt(pagesize * currentindex + 1) + ' to ' + parseInt(pagesize * currentindex + parseInt(pagesize)) + ' out of ' + totalrecord + ' items </p>')
        }
    }

    if (totalrecord === 0) {
        pagestring = '<ul class="pagination justify-content-center">' +
            '<li class="page-item disabled"><a class="page-link" href="#">Previous</a></li>' +
            '<li class="page-item disabled"><a class="page-link" href="#">Next</a></li>' +
            '<li class="page-item disabled"><a class="page-link" href="#">Last</a></li>' +
            '</ul>';
    }
    else {
        let pagination = '<ul class="pagination justify-content-center">';

        // First and Previous Page Links
        if (currentindex === 0) {
            pagination += '<li class="page-item disabled"><a class="page-link" href="#">First</a></li>' +
                '<li class="page-item disabled"><a class="page-link" href="#">Previous</a></li>';
        } else {
            pagination += '<li class="page-item"><a class="page-link" href="#" onclick="Search' + pageName + '(0);">First</a></li>' +
                '<li class="page-item"><a class="page-link" href="#" onclick="Search' + pageName + '(' + parseInt(currentindex - 1) + ');">Previous</a></li>';
        }

        var counter = 0;
        var intial = currentindex < 5 ? 0 : parseInt(currentindex) - 3;

        // Page number links
        for (var i = intial; i < pagerlink; i++) {
            var j = i + 1;
            if (i === currentindex) {
                pagination += '<li class="page-item active"><a class="page-link" href="#">' + j + '</a></li>';
            } else {
                pagination += '<li class="page-item"><a class="page-link" href="#" onclick="Search' + pageName + '(' + i + ');">' + j + '</a></li>';
            }
            if (counter === 5) break;
            counter++;
        }

        // Next and Last Page Links
        if (currentindex === lastindex) {
            pagination += '<li class="page-item disabled"><a class="page-link" href="#">Next</a></li>' +
                '<li class="page-item disabled"><a class="page-link" href="#">Last</a></li>';
        } else {
            var nextindex = (parseInt(currentindex) + 1);
            pagination += '<li class="page-item"><a class="page-link" href="#" onclick="Search' + pageName + '(' + nextindex + ');">Next</a></li>' +
                '<li class="page-item"><a class="page-link" href="#" onclick="Search' + pageName + '(' + lastindex + ');">Last</a></li>';
        }

        pagination += '</ul>';
        $("#" + divPagesId).html('');
        $("#" + divPagesId).append(pagination);
    }
}
