// Vendor Modules
import $ from 'jquery';
import _ from 'underscore';

// CSS
import './css/foundation.css';
import './css/style.css';

// Models and Collections
import Trip from './app/models/trip';
import TripList from './app/collections/trip-list';
import Reservation from './app/models/reservation';

let tripTemplate;
let tripDetailTemplate;
let reserveModalTemplate;
let addTripModalTemplate;

// Trip List

const tripList = new TripList();

const render = function render(tripList) {
  const tripListElement = $('#trip-list ul');
  tripList.forEach((trip) => {
    const generatedHTML = $(tripTemplate(trip.attributes));
    generatedHTML.on('click', show);
    tripListElement.append(generatedHTML);
  });
};

const show = function show(e) {
  if (!$(e.target).hasClass('button')){
    const tripElement = $(e.target).closest('li');
    if (tripElement.hasClass('show')) {
      clearShow();
    } else {
      const id = findElementTripID(e);
      const trip = tripList.findWhere({id: 2});
      trip.fetch({
        success: () => {
          clearShow();
          $('.trip-row').removeClass('show');
          $('.trip-details').remove();
          const generatedHTML = $(tripDetailTemplate(trip.attributes));
          const reserveBtn = generatedHTML.find('.reserve-btn');
          reserveBtn.on('click', reserveModal);
          tripElement.append(generatedHTML).addClass('show');
        }
      });
    }
  }
};

const clearShow = function clearShow() {
  $('.trip-row').removeClass('show');
  $('.trip-detail-holder').remove();
};

// Modals

const saveIfValid = function saveIfValid(object, form) {
  if (object.isValid()) {
    object.save({}, {
      success: (response) => {
        formSuccess('reservation', form)
      },
      error: (status, response) => {
        const errors = ($.parseJSON(response.responseText))['errors'];
        printErrors(errors);
      },
    });
  } else {
    printErrors(object.validationError);
  }
};

const printErrors = function printErrors(errors) {
  for(let field in errors) {
    let errorElement = $(`#reserve-${field} > label`);
    errorElement.addClass('has-errors');
    errorElement.append(`<p class="error">${errors[field]}</p>`);
  }
};

const clearErrors = function clearErrors() {
  $('.has-errors').removeClass('has-errors');
  $('.error').remove();
};

const formSuccess = function formSuccess(item, form) {
  const messageBox = $(form.find('.form-messages'));
  console.log(messageBox);
  messageBox.html(`<p class="success">Successfully created ${item}!</p>`);
  form[0].reset();
}

const getFormData = function getFormData(target, values) {
  const formData = {};
  values.forEach((value) => {
    let targetElement = target.find(`[name="${ value }"]`);
    formData[value] = targetElement.val();
  });
  return formData;
};

const clearModal = function clearModal(e) {
  if ($(e.target).hasClass('modal-close')) {
    console.log('clearing modals');
    $('.modal').remove();
  }
};

const findElementTripID = function findElementTripID(e) {
  return $(e.target).closest('li')[0].id;
};

const addTripModal = function addTripModal() {
  $('body').append(addTripModalTemplate());
};

const reserveModal = function reserveModal(e) {
  const id = findElementTripID(e);
  const generatedHTML = $(reserveModalTemplate({'id': id}));
  const form = generatedHTML.find('#reservation-form');
  form.on('submit', submitReservation);
  $('body').append(generatedHTML);
};

const submitTrip = function submitTrip(e) {
  e.preventDefault();
  const form = $(e.target);
  const formData = getFormData(form, ['name', 'continent', 'category', 'weeks', 'cost']);
  const newTrip = new Trip(formData);
  saveIfValid(newTrip, form);
};

const submitReservation = function submitReservation(e) {
  e.preventDefault();
  clearErrors();
  $('.form-messages').html('');
  const form = $('#reservation-form');
  const id = form[0].classList[0];
  // can this ID be transmitted with the form instead?
  const formData = getFormData($(e.target), ['name', 'email']);
  formData['tripID'] = id;
  const newReservation = new Reservation(formData);
  saveIfValid(newReservation, form);
};

$(document).ready( () => {
  $('#trip-list').hide();
  tripTemplate = _.template($('#trip-template').html());
  tripDetailTemplate = _.template($('#trip-detail-template').html());
  reserveModalTemplate = _.template($('#reserve-modal-template').html());
  addTripModalTemplate = _.template($('#add-trip-modal-template').html());

  tripList.on('update', render);

  $('#intro-button').on('click', (e) => {
    $('#intro-button').hide(200);
    tripList.fetch();
    $('#trip-list').show(500);
  });

  $('#add-trip').on('click', addTripModal);

  $('body').on('click', '.modal-close', clearModal);

  // $(document).on('submit', '#add-trip-form', submitTrip;
  $(document).on('submit', '#add-trip-form', submitTrip);
});
