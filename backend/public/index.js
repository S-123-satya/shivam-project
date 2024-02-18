// decode the logged in user
const url = `http://localhost:3000`;
const token = localStorage.getItem("accessToken");
function parseJwt(token) {
  if (!token) {
    return;
  }
  const base64Url = token.split(".")[1];
  const base64 = base64Url.replace("-", "+").replace("_", "/");
  return JSON.parse(window.atob(base64));
}

// loggedin user
const user = parseJwt(token);
console.log(user);


const form = document.getElementById("form");
const input = document.getElementById("input");
const messages = document.getElementById("messages");

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  try {
    if (input.value) {
      const obj = {
        message: input.value,
        sender: user._id,
      };
      const clientOffset = `${socket.id}-${counter++}`;
      const response = await axios.post(`${url}/chat`, obj);
      if (response.data.statusCode == 201) {
        //shoul send the obj because it contains more things and for more info we should send response data because it contains all the information like createdAt and updatedAt
        displayChat("You", response.data.data.message);
        socket.emit(
          "chat message",
          { data: response.data.data, sender: user.username },
          clientOffset
        );
      } else {
        alert("someting went wrong");
      }
      input.value = "";
    }
  } catch (error) {
    const refreshToken=localStorage.getItem("refreshToken");
    axios.post(`${url}/user/refresh`,{refreshToken})
    .then(user=>{
      const {accessToken,refreshToken}=user.data.data;
      localStorage.setItem("refreshToken", refreshToken);
      localStorage.setItem("accessToken", accessToken);
    })
    .catch(err=>console.log(`login again token expire or sothing went wrong`))
  }
});
/**
 * @socket listing connections
 */
socket.on("chat message", (msg, serverOffset) => {
  displayChat(msg.sender, msg.data.message);
  socket.auth.serverOffset = serverOffset;
});
socket.on("poll created", (poll, serverOffset) => {
  // we need to display poll
  displayPoll(poll);
  socket.auth.serverOffset = serverOffset;
});
socket.on("poll updated", (modify, serverOffset) => {
  // we need to display poll
  console.log(modify);
  displayModifyPoll(modify);
  socket.auth.serverOffset = serverOffset;
});

function displayModifyPoll(modify) {
  const { updatedOption, existedUserOption } = modify;
  if (updatedOption) {
    const updatedOptionItem = document.getElementById(
      String(updatedOption._id)
    );
    //now update the vote
    updatedOptionItem.parentElement.lastChild.innerText = `${updatedOption.optionText} :: ${updatedOption.voteCount}`;
  }
  if (existedUserOption) {
    const existedUserOptionItem = document.getElementById(
      existedUserOption._id
    );
    //now update the vote
    existedUserOptionItem.parentElement.lastChild.innerText = `${existedUserOption.optionText} :: ${existedUserOption.voteCount}`;
  }
}
/**
 * @description display chat function
 * @param {@param} sender
 * @param {@param} msg
 */

async function updatePollVote(e) {
 
  try {
    const obj = {
      pollId: e.target.parentElement?.parentElement?.id,
      optionId: e.target?.id,
    };
    const response = await axios.patch(`${url}/poll`, obj);
    const { existedUserOption, updatedOption } = response?.data?.data;
    const modify = {
      existedUserOption,
      updatedOption,
    };
    socket.emit("poll updated", modify);
    displayModifyPoll(modify);
  } catch (error) {
    const refreshToken=localStorage.getItem("refreshToken");
    axios.post(`${url}/user/refresh`,{refreshToken})
    .then(user=>{
      const {accessToken,refreshToken}=user.data.data;
      localStorage.setItem("refreshToken", refreshToken);
      localStorage.setItem("accessToken", accessToken);
    })
    .catch(err=>console.log(`login again token expire or sothing went wrong`))
  }
}

function displayPoll(poll) {
  // run a loop for generating options
  const questionContainer = document.createElement("div");
  questionContainer.id = poll?.newPoll?._id;
  // Create question element
  let sender = poll?.sender;
  if (poll?.sender == user.username) sender = "You";
  const questionElement = document.createElement("p");
  questionElement.textContent = `${sender} : ${poll?.newPoll?.question}`;
  questionContainer.appendChild(questionElement);
  if (poll?.newPoll?.isMultipleSelect) {
    //checkbox with multiple selection options
    poll.options.forEach((option, index) => {
      const optionElement = document.createElement("input");
      optionElement.setAttribute("type", "checkbox");
      optionElement.setAttribute("name", poll?.newPoll?._id);
      optionElement.setAttribute("value", option?.optionText);
      optionElement.id = option?._id;
      optionElement.addEventListener("click", updatePollVote);
      const labelElement = document.createElement("label");
      labelElement.setAttribute("for", option?._id);
      labelElement.textContent = `${option?.optionText} :: ${option?.voteCount}`;

      const optionWrapper = document.createElement("div");
      optionWrapper.appendChild(optionElement);
      optionWrapper.appendChild(labelElement);
      questionContainer.appendChild(optionWrapper);
    });
  } else {
    // radio button with single selection

    // Create radio buttons for each option
    poll.options.forEach((option, index) => {
      const optionElement = document.createElement("input");
      optionElement.setAttribute("type", "radio");
      optionElement.setAttribute("name", poll?.newPoll?._id);
      optionElement.setAttribute("value", option?.optionText);
      optionElement.id = option?._id;
      optionElement.addEventListener("click", updatePollVote);
      const labelElement = document.createElement("label");
      labelElement.setAttribute("for", option?._id);
      labelElement.textContent = `${option?.optionText} :: ${option?.voteCount}`;

      const optionWrapper = document.createElement("div");
      optionWrapper.appendChild(optionElement);
      optionWrapper.appendChild(labelElement);
      questionContainer.appendChild(optionWrapper);
    });
  }
  messages.appendChild(questionContainer);
  window.scrollTo(0, document.body.scrollHeight);
}
function displayChat(sender, msg) {
  const item = document.createElement("li");
  item.textContent = `${sender} : ${msg}`;
  messages.appendChild(item);
  window.scrollTo(0, document.body.scrollHeight);
}

const createPollBtn = document.getElementById("createPollBtn");
const pollModal = document.getElementById("pollModal");
const closeBtn = document.querySelector(".close");
const addOptionBtn = document.getElementById("addOptionBtn");
const pollForm = document.getElementById("pollForm");
const optionsContainer = document.getElementById("options");

createPollBtn.addEventListener("click", () => {
  pollModal.style.display = "block";
});

closeBtn.addEventListener("click", () => {
  pollModal.style.display = "none";
});

window.addEventListener("click", (event) => {
  if (event.target == pollModal) {
    pollModal.style.display = "none";
  }
});

addOptionBtn.addEventListener("click", () => {
  if (optionsContainer.lastElementChild.lastElementChild.value) {
    const optionNum = optionsContainer.childElementCount + 1;
    const div = document.createElement("div");
    const label = document.createElement("label");
    label.htmlFor = `option${optionNum}`;
    label.textContent = `Option ${optionNum}:`;
    const input = document.createElement("input");
    input.type = "text";
    input.id = `option${optionNum}`;
    input.name = "option";
    div.appendChild(label);
    div.appendChild(input);
    optionsContainer.appendChild(div);
  }
});

pollForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const multiSelect = document.getElementById("multiSelect");
  const questionInput = document.getElementById("question");

  const n = optionsContainer.children.length;
  const optionsList = [];
  for (let i = 0; i < n; i++) {
    optionsList.push(optionsContainer.children[i].children[1].value);
  }
  const obj = {
    question: questionInput.value,
    options: optionsList,
    isMultipleSelect: multiSelect.checked,
  };
  // Here you can send the pollData to your backend for further processing
  const response = await axios.post(`${url}/poll`, obj);
  socket.emit("poll created", response.data.data);
  displayPoll(response.data.data);
  pollModal.style.display = "none";
});
