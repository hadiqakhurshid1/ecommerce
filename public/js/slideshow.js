  var slideCounter=0;
  var slidePath=[];
  slidePath[0] = "/img/slide1.png";
  slidePath[1] = "/img/slide2.png";

  function imageSlider(){
    //update dom slide src value
    document.slide.src = slidePath[slideCounter];

    if(slideCounter<slidePath.length-1){
      slideCounter++;
    }else{
      slideCounter=0;
    }

    setTimeout(function(){
      imageSlider();
    }, 3000);
  }

  imageSlider();
