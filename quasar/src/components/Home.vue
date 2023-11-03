<template>
  <q-layout view="lHr lpR fFf">
    <q-header height-hint="98"> </q-header>
    <q-page-container>
      <q-page padding class="column items-center">
        <q-form class="column" @submit="onCreateItem" style="width: 500px">
          <div class="row">
            <q-input
              class="col-12"
              autocomplete="off"
              outlined
              dense
              v-model="title"
              label="Title"
              lazy-rules
              :rules="[
                (val) => (val && val.length > 0) || 'Title is required.',
                (val) =>
                  (val && val.length <= 200) ||
                  'Title is limited to 200 characters.',
              ]"
            >
            </q-input>
          </div>
          <div class="row">
            <q-input
              class="col-12"
              rows="2"
              type="textarea"
              autocomplete="off"
              outlined
              dense
              v-model="description"
              label="Description"
              lazy-rules
              :rules="[
                (val) =>
                  val.length <= 2000 ||
                  'Descripton is limited to 2000 characters.',
              ]"
            >
            </q-input>
          </div>
          <div class="row justify-between">
            <q-input
              class="col-9 q-mr-sm"
              dense
              outlined
              v-model="dueDate"
              label="Due Date"
            >
              <template v-slot:append>
                <q-icon name="event" class="cursor-pointer">
                  <q-popup-proxy
                    cover
                    transition-show="scale"
                    transition-hide="scale"
                  >
                    <q-date v-model="dueDate" mask="YYYY-MM-DD">
                      <div class="row items-center justify-end">
                        <q-btn
                          v-close-popup
                          label="Close"
                          color="primary"
                          flat
                        />
                      </div>
                    </q-date>
                  </q-popup-proxy>
                </q-icon>
              </template>
            </q-input>
            <q-btn class="col" outline label="Create" type="submit" style="height: 40px" />
          </div>
        </q-form>
        <q-separator
          color="accent"
          class="row q-mt-md q-mb-md"
          style="width: 500px"
        />
        <div v-for="item in items" :key="item.id" class="caption row">
          <q-card class="my-card q-mb-sm" flat bordered style="width: 500px">
            <q-card-section class="q-pa-none">
              <q-card-section class="q-pa-sm row justify-between">
                <div class="title col-10 col-lg-10 col-xl-11" style="overflow-wrap: anywhere;">
                  <q-checkbox :true-value="1" :false-value="0" :model-value="item.isDone" @update:model-value="done(item)"/>
                  <span :class="item.isDone == 1 ? 'text-strike' : ''">{{ item.title }}</span>
                </div>
                <div class="actions col-2 col-lg-2 col-xl-1 row justify-end items-center">
                  <q-icon size="sm" color="info" name="o_info">
                    <q-tooltip class="bg-accent">
                      <div>
                        Created On: {{ item.createdDate }}
                      </div>
                      <div>
                        Due Date: {{ item.dueDate ? item.dueDate : "none"}}
                      </div>
                      <div>
                        Description:
                      </div>
                      <div  style="white-space: pre-wrap;">{{item.description}}</div>
                    </q-tooltip>
                  </q-icon>
                  <q-icon v-if="item.isDone !== 1 && isDueDate(item.dueDate)" class="q-ml-xs" size="sm" color="accent" name="o_query_builder">
                    <q-tooltip class="bg-accent">
                      Over due: {{ overDueDate(item.dueDate) }} day(s)
                    </q-tooltip>
                  </q-icon>
                </div>
              </q-card-section>
            </q-card-section>
          </q-card>
        </div>
      </q-page>
    </q-page-container>

    <q-footer>
      <q-toolbar>
        <q-toolbar-title
          >{{ $q.screen.name }}, width: {{ $q.screen.width }}
        </q-toolbar-title>
      </q-toolbar>
    </q-footer>
  </q-layout>
</template>

<script setup lang="ts">
import { onBeforeMount, ref, Ref } from 'vue';
import { CreateItemRequest } from '../models/CreateItemRequest';
import { UpdateStatusRequest } from '../models/UpdateStatusRequest';
import { date } from 'quasar';
import { Item } from '../models/Item';

const title = ref('');
const description = ref('');
const dueDate = ref('');
const items: Ref<Item[]> = ref([]);
onBeforeMount(async () => {
  items.value = await fetch(`http://${process.env.API_SERVER}/items`).then((res) =>
    res.json()
  );
});
var socket = new WebSocket(`ws://${process.env.API_SERVER}/ws`);
// message is received
socket.addEventListener('message', (event) => {
  console.log('event', event);
  const receivedData = JSON.parse(event.data)
  if (receivedData.type === 'update') {
    const index = items.value.findIndex((item) => item.id === receivedData.id);
    if (index !== -1) {
      items.value[index].isDone = receivedData.isDone;
    }
  } else if (receivedData.type === 'create') {
    const itemTemp = JSON.parse(event.data) as Item;
    items.value.unshift(itemTemp);  
  }
});

// socket opened
socket.addEventListener('open', (event) => {
  console.log('open', event);
});

// socket closed
socket.addEventListener('close', (event) => {
  console.log('close', event);
});

// error handler
socket.addEventListener('error', (event) => {
  console.log('error', event);
});
async function onCreateItem() {
  const createItemRequest: CreateItemRequest = {
    title: title.value,
    description: description.value,
    dueDate: dueDate.value,
  };
  const response = await fetch(`http://${process.env.API_SERVER}/items`, {
    method: 'POST',
    body: JSON.stringify(createItemRequest),
    headers: {
      'Content-Type': 'application/json',
    },
  });
  const data = await response.json();
  items.value.unshift(data[0]);
  
  const createItem = {
    type: 'create',
    ...data[0]
  }
  socket.send(JSON.stringify(createItem));
}
async function done(item: Item) {
  console.log('item', item);
  const updateStatusRequest: UpdateStatusRequest = {
    id: item.id,
    isDone: item.isDone === 1 ? false : true,
  }
  const response: Response = await fetch(`http://${process.env.API_SERVER}/items/done`, {
    method: 'POST',
    body: JSON.stringify(updateStatusRequest),
    headers: {
      'Content-Type': 'application/json',
    },
  });
  if (response.ok) {
    const index = items.value.findIndex(x => x.id === item.id);
    items.value[index].isDone = updateStatusRequest.isDone === true ? 1 : 0;
    const data = await response.json();
    const updateItem = {
      type: 'update',
      ...data[0],
    }
    socket.send(JSON.stringify(updateItem));
  }
}
function isDueDate(dueDate: Date): boolean {
  if (dueDate === null) {
    return false
  }
  const today = new Date()
  const dateDiff = date.getDateDiff(dueDate, today, 'days')
  console.log('dateDiff', dateDiff)
  if (dateDiff < 0) {
    return true
  }
  return false
}
function overDueDate(dueDate: Date): number {
  const today = new Date()
  const dateDiff = date.getDateDiff(today, dueDate, 'days')
  return dateDiff
}
</script>
