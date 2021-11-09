<template>
  <div class="form">
    <form @submit.prevent="handleSubmit()">
      <h2>Личные данные</h2>
      <div class="row">
        <label>Фамилия</label>
        <a-input
          v-model="formData.lastName"
          :class="{ error: !isLastNameValid }"
        ></a-input>
        <label>Имя</label>
        <a-input
          v-model="formData.firstName"
          :class="{ error: !isFirstNameValid }"
        ></a-input>
        <label>Отчество</label>
        <a-input
          v-model="formData.patronymic"
          :class="{ error: !isPatronymicValid }"
        ></a-input>
      </div>
      <div class="row">
        <label>Дата рождения</label>
        <a-date-picker
          :class="{ error: !isBirthdayValid }"
          :style="{ width: '200px' }"
          :default-value="formData.birthday"
          @change="onBirthdayChange"
        />
      </div>
      <div class="row">
        <label>E-mail</label>
        <a-input
          v-model="formData.email"
          :class="{ error: !isEmailValid }"
        ></a-input>
      </div>
      <div class="row">
        <a-radio-group v-model="formData.gender">
          <a-radio :value="1"> Мужской </a-radio>
          <a-radio :value="2"> Женский </a-radio>
        </a-radio-group>
      </div>

      <h2>Паспортные данные</h2>
      <div class="row">
        <a-select
          class="dropdown"
          :default-value="citizenshipValue"
          show-search
          :filter-option="false"
          placeholder="Введите гражданство"
          option-filter-prop="children"
          :v-model="formData.citizenship"
          @search="debouncedFindCitizenship"
          @change="handleChangeCitizenship"
        >
          <a-select-option
            v-for="option in findedCitizenshipsOptions"
            :value="option.id"
            :key="option.id"
          >
            {{ option.nationality }}
          </a-select-option>
        </a-select>
      </div>
      <div
        class="row for-russian"
        v-if="formData.citizenship === russianNationalityId"
      >
        <label for="passport-seria">Серия паспорта</label>
        <a-input
          id="passport-seria"
          v-model="formData.passSeria"
          :class="{ error: !isPassSeriaValid }"
        ></a-input>
        <label for="passport-number">Номер паспорта</label>
        <a-input
          id="passport-number"
          v-model="formData.passNumber"
          :class="{ error: !isPassNumberValid }"
        ></a-input>
        <label for="passport-number">Дата выдачи</label>
        <a-date-picker
          :class="{ error: !isBirthdayValid }"
          :style="{ minWidth: '200px' }"
          :default-value="formData.passportIssueDate"
          @change="onPassportIssueDate"
        />
      </div>
      <div
        class="passport-fields for-not-russian"
        v-else-if="
          formData.citizenship && formData.citizenship !== russianNationalityId
        "
      >
        <div class="row">
          <label>Фамилия на латинице</label>
          <a-input
            v-model="formData.translitLastName"
            :class="{ error: !isTranslitLastNameValid }"
          ></a-input>
          <label>Имя на латинице</label>
          <a-input
            v-model="formData.translitFirstName"
            :class="{ error: !isTranslitFirstNameValid }"
          ></a-input>
        </div>
        <div class="row">
          <label for="foreign-passport-number">Номер паспорта</label>
          <a-input
            id="foreign-passport-number"
            v-model="formData.foreignPassNumber"
          ></a-input>

          <label for="passport-number">Страна выдачи</label>
          <a-select class="dropdown" v-model="formData.issueCountry">
            <a-select-option
              v-for="option in citizenshipsOptions"
              :value="option.id"
              :key="option.id"
            >
              {{ option.nationality }}
            </a-select-option>
          </a-select>
          <label for="passport-number">Тип паспорта</label>
          <a-select class="dropdown" v-model="formData.passportType">
            <a-select-option
              v-for="option in passportTypes"
              :value="option.id"
              :key="option.id"
            >
              {{ option.type }}
            </a-select-option>
          </a-select>
        </div>
      </div>

      <div class="row">
        <a-radio-group v-model="formData.changeName">
          <a-radio :value="false"> Нет </a-radio>
          <a-radio :value="true"> Да </a-radio>
        </a-radio-group>
      </div>
      <div class="row" v-if="formData.changeName">
        <label>Предыдущая фамилия</label>
        <a-input
          v-model="formData.previousLastName"
          :class="{ error: !isPreviousLastNameValid }"
        ></a-input>
        <label>Предыдущее имя</label>
        <a-input
          v-model="formData.previousFirstName"
          :class="{ error: !isPreviousFirstNameValid }"
        ></a-input>
      </div>
      <div class="row">
        <a-button htmlType="submit">Отправить</a-button>
      </div>
    </form>
  </div>
</template>

<script>
import citizenships from "../assets/data/citizenships.json";
import passportTypes from "../assets/data/passport-types.json";
import { debounce } from "../helpers/debounce";
import { validate } from "isemail";

const onlyRusLetters = /[а-я]+/i;
const onlyLatinLetters = /[A-z]+/i;
const onlyDigits = /\d+/;
const russianNationalityId = 8604;
const MIN_SERIA_LENGTH = 4;
const MIN_NUMBER_LENGTH = 6;
export default {
  data() {
    return {
      formData: {
        firstName: "",
        lastName: "",
        birthday: "",
        email: "",
        patronymic: "",
        gender: 1,
        citizenship: russianNationalityId,
        changeName: false,
        passportType: "",
        translitFirstName: "",
        translitLastName: "",
        passNumber: "",
        passSeria: "",
        foreignPassNumber: "",
        issueCountry: "",
        previousFirstName: "",
        previousLastName: "",
      },
      passportTypes,
      russianNationalityId,
      citizenshipsOptions: citizenships,
      findedCitizenshipsOptions: null,
      debouncedFindCitizenship: null,
      isEmailValid: true,
      isFirstNameValid: true,
      isLastNameValid: true,
      isPreviousLastNameValid: true,
      isPreviousFirstNameValid: true,
      isPatronymicValid: true,
      isBirthdayValid: true,
      isPassSeriaValid: true,
      isPassNumberValid: true,
      isTranslitLastName: true,
      isTranslitFirstName: true,
      isTranslitFirstNameValid: true,
      isTranslitLastNameValid: true,
    };
  },
  methods: {
    handleChangeCitizenship(newValue) {
      this.formData.citizenship = newValue;
    },
    checkByRegexp(regexp, value) {
      return regexp.test(value);
    },
    checkFirstName() {
      if (this.checkByRegexp(onlyRusLetters, this.formData.firstName)) {
        this.isFirstNameValid = true;
      } else {
        this.isFirstNameValid = false;
      }
    },
    checkLastName() {
      if (this.checkByRegexp(onlyRusLetters, this.formData.lastName)) {
        this.isLastNameValid = true;
      } else {
        this.isLastNameValid = false;
      }
    },
    checkPreviousFirstName() {
      if (this.checkByRegexp(onlyRusLetters, this.formData.previousFirstName)) {
        this.isPreviousFirstNameValid = true;
      } else {
        this.isPreviousFirstNameValid = false;
      }
    },
    checkPreviousLastName() {
      if (this.checkByRegexp(onlyRusLetters, this.formData.previousLastName)) {
        this.isPreviousLastNameValid = true;
      } else {
        this.isPreviousLastNameValid = false;
      }
    },
    checkPatronymic() {
      if (this.checkByRegexp(onlyRusLetters, this.formData.patronymic)) {
        this.isPatronymicValid = true;
      } else {
        this.isPatronymicValid = false;
      }
    },
    checkEmail() {
      if (validate(this.formData.email)) {
        this.isEmailValid = true;
      } else {
        this.isEmailValid = false;
      }
    },
    checkBirthday() {
      const currDate = new Date();
      const checkedDate = new Date(this.formData.birthday);
      if (
        this.formData.birthday &&
        currDate.getTime() > checkedDate.getTime()
      ) {
        this.isBirthdayValid = true;
      } else {
        this.isBirthdayValid = false;
      }
    },
    checkPassSeria() {
      if (
        this.checkByRegexp(onlyDigits, this.formData.passSeria) &&
        this.formData.passSeria.length === MIN_SERIA_LENGTH
      ) {
        this.isPassSeriaValid = true;
      } else {
        this.isPassSeriaValid = false;
      }
    },
    checkPassNumber() {
      if (this.formData.citizenship === russianNationalityId) {
        if (
          this.checkByRegexp(onlyDigits, this.formData.passNumber) &&
          this.formData.passNumber.length === MIN_NUMBER_LENGTH
        ) {
          this.isPassNumberValid = true;
        } else {
          this.isPassNumberValid = false;
        }
      } else {
        this.isPassNumberValid = true;
      }
    },
    checkTranslitLastName() {
      if (
        this.checkByRegexp(onlyLatinLetters, this.formData.translitLastName)
      ) {
        this.isTranslitLastNameValid = true;
      } else {
        this.isTranslitLastNameValid = false;
      }
    },
    checkTranslitFirstName() {
      if (
        this.checkByRegexp(onlyLatinLetters, this.formData.translitFirstName)
      ) {
        this.isTranslitFirstNameValid = true;
      } else {
        this.isTranslitFirstNameValid = false;
      }
    },
    checkForm() {
      this.checkFirstName();
      this.checkLastName();
      this.checkPatronymic();
      this.checkPreviousFirstName();
      this.checkPreviousLastName();
      this.checkEmail();
      this.checkBirthday();
      this.checkPassSeria();
      this.checkPassNumber();
      this.checkTranslitLastName();
      this.checkTranslitFirstName();
    },
    handleSubmit() {
      this.checkForm();
      console.log(this.formData);
    },
    onBirthdayChange(date, dateString) {
      this.formData.birthday = dateString;
    },
    onPassportIssueDate(date, dateString) {
      this.formData.birthday = dateString;
    },
    handleInputLastName(event) {
      if (event.target.value.match(onlyRusLetters)) {
        this.formData.lastName = event.target.value;
      }
    },
    findCitizenship(value) {
      if (value) {
        this.findedCitizenshipsOptions = citizenships.filter((option) =>
          option.nationality.toLowerCase().includes(value.toLowerCase())
        );
      } else {
        this.findedCitizenshipsOptions = null;
      }
    },
  },
  created() {
    this.debouncedFindCitizenship = debounce(this.findCitizenship, 1000);
  },
  computed: {
    citizenshipValue: function () {
      return citizenships.find(
        (citizenship) => citizenship.id === this.formData.citizenship
      ).nationality;
    },
  },
};
</script>

<style scoped>
.form {
  max-width: 870px;
  margin: 0 auto;
}
.full-name {
  display: flex;
}

input {
  margin-right: 10px;
}

.row {
  margin-bottom: 15px;
  display: flex;
}

.passport-data {
  display: flex;
}

.radio-group {
  margin-bottom: 15px;
}

.change-name-inputs {
  display: flex;
}

label {
  margin-right: 5px;
  line-height: 1;
}
input {
  margin-right: 15px;
}

.dropdown {
  width: 200px;
  margin-right: 15px;
}
.error {
  border-color: red;
}

.error input {
  border: 1px solid red;
}

.error.ant-calendar-picker {
  border: 1px solid red;
  border-radius: 4px;
}
</style>
